package com.moneyos.dto.response;

import com.moneyos.enums.BudgetStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BudgetResponse(
        UUID id,
        String name,
        UUID categoryId,
        String categoryName,
        BigDecimal amount,
        BigDecimal spentAmount,
        BigDecimal remainingAmount,
        BigDecimal utilizationPercentage,
        BudgetStatus status,
        String month,
        Instant createdAt,
        Instant updatedAt
) {}
