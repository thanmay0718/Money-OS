package com.moneyos.controller;

import com.moneyos.dto.request.LoginRequest;
import com.moneyos.dto.response.AuthResponse;
import com.moneyos.security.JwtService;
import com.moneyos.service.AuthService;
import com.moneyos.service.TokenRevocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;




@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final TokenRevocationService tokenRevocationService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
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
