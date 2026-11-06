package com.moneyos.service;

import com.moneyos.dto.response.AchievementResponse;
import com.moneyos.dto.response.GamificationOverviewResponse;

import java.util.List;
import java.util.UUID;

public interface AchievementService {
    GamificationOverviewResponse getGamificationOverview(UUID userId);
    List<AchievementResponse> evaluateAchievements(UUID userId);
}
