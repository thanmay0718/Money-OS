package com.moneyos.dto.response;

import com.moneyos.enums.GoalStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FinancialGoalResponse(
        UUID id,
        String title,
        BigDecimal targetAmount,
        BigDecimal savedAmount,
        BigDecimal remainingAmount,
        String currency,
        LocalDate targetDate,
        GoalStatus status,
        BigDecimal progressPercentage,
        Instant createdAt,
        Instant updatedAt
) {
    public FinancialGoalResponse(
            UUID id,
            String title,
            BigDecimal targetAmount,
            BigDecimal savedAmount,
            String currency,
            LocalDate targetDate,
            GoalStatus status,
            BigDecimal progressPercentage,
            Instant createdAt,
            Instant updatedAt
    ) {
        this(
                id,
                title,
                targetAmount,
                savedAmount,
                (targetAmount != null && savedAmount != null && targetAmount.subtract(savedAmount).compareTo(BigDecimal.ZERO) > 0)
                        ? targetAmount.subtract(savedAmount)
                        : BigDecimal.ZERO,
                currency,
                targetDate,
                status,
                progressPercentage,
                createdAt,
                updatedAt
        );
    }
}
