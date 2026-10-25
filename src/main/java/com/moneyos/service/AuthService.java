
package com.moneyos.service;

import com.moneyos.dto.request.LoginRequest;
import com.moneyos.dto.response.AuthResponse;
import com.moneyos.dto.response.UserResponse;
import com.moneyos.entity.User;
import com.moneyos.repository.UserRepository;
import com.moneyos.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(email)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .currency(user.getCurrency())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationSeconds())
                .user(userResponse)
                .build();
    }
}


//What this service does
//- Normalizes the email to lowercase.
//- Finds the user and excludes soft-deleted accounts.
//        - Checks the raw password against the stored BCrypt hash.
//- Returns a signed JWT and safe user profile.
//        - Uses the same generic error for unknown emails and incorrect passwords.