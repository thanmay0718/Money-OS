package com.moneyos.dto.response;

import java.time.Instant;

public record AchievementResponse(
        String code,
        String title,
        String description,
        String category,
        String icon,
        boolean unlocked,
        Instant unlockedAt,
        int currentProgress,
        int targetProgress,
        double progressPercentage,
        int coinReward
) {}
