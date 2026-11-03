package com.moneyos.service;

import com.moneyos.dto.response.AuthResponse;
import com.moneyos.dto.response.UserResponse;
import com.moneyos.entity.OAuthAccount;
import com.moneyos.entity.User;
import com.moneyos.enums.UserRole;
import com.moneyos.repository.OAuthAccountRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OAuth2AuthenticationService {

    private final UserRepository userRepository;
    private final OAuthAccountRepository oauthAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthResponse authenticate(Authentication authentication, OAuth2User principal) {
        if (!(authentication instanceof OAuth2AuthenticationToken token)) {
            throw oauthException("Unsupported OAuth2 authentication");
        }

        String provider = token.getAuthorizedClientRegistrationId().toLowerCase(Locale.ROOT);
        String providerAccountId = providerAccountId(provider, principal);
        OAuthAccount existingIdentity = oauthAccountRepository
                .findByProviderAndProviderAccountId(provider, providerAccountId)
                .orElse(null);

        User user;
        boolean created;
        if (existingIdentity != null) {
            user = existingIdentity.getUser();
            created = false;
        } else {
            user = createIdentity(provider, providerAccountId, principal);
            created = true;
        }

        if (user.getDeletedAt() != null) {
            throw oauthException("This account is unavailable or has been deactivated");
        }

        auditLogService.log(
                created ? "OAUTH_USER_REGISTERED" : "OAUTH_LOGIN",
                user.getEmail(),
                user.getEmail(),
                "OAuth login completed using provider " + provider
        );

        return authResponse(user);
    }

    private User createIdentity(String provider, String providerAccountId, OAuth2User principal) {
        String email = normalizedEmail(principal);
        User user;

        try {
            if (userRepository.findByEmail(email).isPresent()) {
                throw oauthException(
                        "An account already exists with this email (" + email + "). Account linking is required."
                );
            }

            user = createUser(provider, email, principal);
            oauthAccountRepository.save(new OAuthAccount(user, provider, providerAccountId));
            return user;
        } catch (DataIntegrityViolationException exception) {
            OAuthAccount concurrentIdentity = oauthAccountRepository
                    .findByProviderAndProviderAccountId(provider, providerAccountId)
                    .orElse(null);
            if (concurrentIdentity != null) {
                return concurrentIdentity.getUser();
            }
            throw oauthException("Account registration collision. Please try again.");
        }
    }

    private User createUser(String provider, String email, OAuth2User principal) {
        String name = firstNonBlank(
                principal.getAttribute("name"),
                principal.getAttribute("given_name"),
                principal.getAttribute("login")
        );
        if (name == null || name.isBlank()) {
            name = email.substring(0, email.indexOf('@'));
        }

        User user = new User(
                name.trim(),
                email,
                passwordEncoder.encode("oauth2:" + provider + ':' + UUID.randomUUID())
        );
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }

    private AuthResponse authResponse(User user) {
        UserResponse profile = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .currency(user.getCurrency())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .deletedAt(user.getDeletedAt())
                .build();

        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationSeconds())
                .user(profile)
                .build();
    }

    private String normalizedEmail(OAuth2User principal) {
        String email = principal.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw oauthException("The OAuth provider did not return a usable email address");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String providerAccountId(String provider, OAuth2User principal) {
        String attribute = "google".equalsIgnoreCase(provider) ? "sub" : "id";
        Object value = principal.getAttribute(attribute);
        if (value == null || value.toString().isBlank()) {
            value = principal.getName();
        }
        if (value == null || value.toString().isBlank()) {
            throw oauthException("The OAuth provider did not return a stable account identifier");
        }
        return value.toString();
    }

    private OAuth2AuthenticationException oauthException(String message) {
        return new OAuth2AuthenticationException(new OAuth2Error("oauth2_error", message, null), message);
    }

    private String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank()) {
                return candidate.trim();
            }
        }
        return null;
    }
}
