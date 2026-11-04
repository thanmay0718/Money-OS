package com.moneyos.dto.response;

import java.math.BigDecimal;

public record OverviewSummaryResponse(
        long totalActivities,
        long activeDays,
        int currentStreak,
        int longestStreak,
        BigDecimal monthlyIncome,
        BigDecimal monthlyExpenses,
        BigDecimal monthlySavings,
        String currency,
        long previousPeriodActivities,
        long previousPeriodActiveDays
) {}
