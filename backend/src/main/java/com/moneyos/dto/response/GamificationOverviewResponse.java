package com.moneyos.dto.response;

import java.util.List;

public record GamificationOverviewResponse(
        StreakDetailsResponse streak,
        List<AchievementResponse> achievements,
        int totalCoins,
        List<AchievementResponse> recentUnlocks
) {}
