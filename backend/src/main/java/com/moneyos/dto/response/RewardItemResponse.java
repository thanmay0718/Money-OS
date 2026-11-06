package com.moneyos.dto.response;

public record RewardItemResponse(
        String code,
        String title,
        String description,
        int costCoins,
        String category, // THEME, BADGE, PERK
        String icon,
        boolean unlocked
) {}
