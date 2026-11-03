package com.moneyos.controller;

import com.moneyos.dto.request.LoginRequest;
import com.moneyos.dto.request.OAuthExchangeRequest;
import com.moneyos.dto.response.AuthResponse;
import com.moneyos.dto.response.UserResponse;
import com.moneyos.entity.User;
import com.moneyos.repository.UserRepository;
import com.moneyos.security.JwtService;
import com.moneyos.service.AuthService;
import com.moneyos.service.OAuthExchangeCodeService;
import com.moneyos.service.TokenRevocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final TokenRevocationService tokenRevocationService;
    private final UserRepository userRepository;
    private final OAuthExchangeCodeService oauthExchangeCodeService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/oauth/exchange")
    public ResponseEntity<AuthResponse> exchangeOAuthCode(
            @Valid @RequestBody OAuthExchangeRequest request) {

        AuthResponse response = oauthExchangeCodeService.exchange(request.code());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            @AuthenticationPrincipal User user) {

        User account = userRepository.findById(user.getId())
                .filter(existing -> existing.getDeletedAt() == null)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return ResponseEntity.ok(UserResponse.builder()
                .id(account.getId())
                .fullName(account.getFullName())
                .email(account.getEmail())
                .currency(account.getCurrency())
                .role(account.getRole())
                .createdAt(account.getCreatedAt())
                .deletedAt(account.getDeletedAt())
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(
                    value = HttpHeaders.AUTHORIZATION,
                    required = false
            ) String authorizationHeader
    ) {
        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authorizationHeader.substring(7).trim();

        if (token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String tokenId = jwtService.extractTokenId(token);
        Instant expiresAt = jwtService.extractExpiration(token);

        tokenRevocationService.revokeToken(tokenId, expiresAt);

        return ResponseEntity.noContent().build();
    }

}
