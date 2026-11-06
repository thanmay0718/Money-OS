package com.moneyos.service;

import java.util.UUID;

public interface CoinService {
    int getBalance(UUID userId);
    boolean awardCoins(UUID userId, int amount, String reason, String referenceType, String referenceId);
    void backfillTransactionCoins(UUID userId);
    boolean redeemReward(UUID userId, String rewardCode);
    java.util.List<com.moneyos.dto.response.RewardItemResponse> getAvailableRewards(UUID userId);
}
