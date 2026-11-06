package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetRecommendationResponse(
        UUID categoryId,
        String categoryName,
        BigDecimal currentSpend,
        BigDecimal recommendedBudget,
        BigDecimal potentialMonthlySavings,
        String benchmarkType,
        String reasoning,
        double confidence
) {}
