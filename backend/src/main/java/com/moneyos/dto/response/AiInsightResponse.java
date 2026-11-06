package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AiInsightResponse(
        String id,
        String title,
        String description,
        InsightType type,
        InsightSeverity severity,
        String categoryName,
        BigDecimal impactAmount,
        String recommendation,
        String actionLabel,
        String actionRoute,
        Instant generatedAt
) {
    public enum InsightType {
        SPENDING_ANOMALY,
        CASHFLOW_WARNING,
        BUDGET_OPPORTUNITY,
        SAVINGS_ACCELERATOR,
        HEALTH_CHECK
    }

    public enum InsightSeverity {
        CRITICAL,
        WARNING,
        INFO,
        POSITIVE
    }
}
