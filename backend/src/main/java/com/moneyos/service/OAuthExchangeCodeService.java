package com.moneyos.service;

import com.moneyos.dto.response.AuthResponse;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthExchangeCodeService {

    private static final Duration CODE_LIFETIME = Duration.ofMinutes(2);

    private final Map<String, ExchangeEntry> pending = new ConcurrentHashMap<>();

    public String create(AuthResponse authResponse) {
        purgeExpired();
        String code = UUID.randomUUID().toString();
        pending.put(code, new ExchangeEntry(authResponse, Instant.now().plus(CODE_LIFETIME)));
        return code;
    }

    public AuthResponse exchange(String code) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("OAuth exchange code is required");
        }

        ExchangeEntry entry = pending.remove(code);
        if (entry == null || entry.expiresAt.isBefore(Instant.now())) {
            throw new IllegalArgumentException("OAuth exchange code is invalid or expired");
        }
        return entry.authResponse;
    }

    private void purgeExpired() {
        Instant now = Instant.now();
        pending.entrySet().removeIf(entry -> entry.getValue().expiresAt.isBefore(now));
    }

    private record ExchangeEntry(AuthResponse authResponse, Instant expiresAt) {}
}
