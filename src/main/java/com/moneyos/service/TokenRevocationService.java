package com.moneyos.service;

import com.moneyos.entity.RevokedToken;
import com.moneyos.repository.RevokedTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;

    public TokenRevocationService(
            RevokedTokenRepository revokedTokenRepository) {
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Transactional
    public void revokeToken(String tokenId, Instant expiresAt) {
        if (revokedTokenRepository.existsByTokenId(tokenId)) {
            return;
        }

        revokedTokenRepository.save(
                new RevokedToken(tokenId, expiresAt)
        );
    }

    @Transactional(readOnly = true)
    public boolean isTokenRevoked(String tokenId) {
        return revokedTokenRepository.existsByTokenId(tokenId);
    }
}