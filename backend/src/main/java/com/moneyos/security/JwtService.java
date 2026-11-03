
package com.moneyos.security;

import com.moneyos.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMillis;

    public JwtService(
            @Value("${moneyos.jwt.secret}") String secret,
            @Value("${moneyos.jwt.expiration-ms:900000}") long expirationMillis) {

        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMillis = expirationMillis;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(expirationMillis);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .id(UUID.randomUUID().toString())
                .compact();
    }

    public UUID extractUserId(String token) {
        String subject = extractClaims(token).getSubject();
        return UUID.fromString(subject);
    }

    public boolean isTokenValid(String token, User user) {
        Claims claims = extractClaims(token);

        return claims.getSubject().equals(user.getId().toString())
                && claims.getExpiration().after(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirationSeconds() {
        return expirationMillis / 1000;
    }

    public String extractTokenId(String token) {
        return extractClaims(token).getId();
    }

    public Instant extractExpiration(String token) {
        return extractClaims(token)
                .getExpiration()
                .toInstant();
    }
}
