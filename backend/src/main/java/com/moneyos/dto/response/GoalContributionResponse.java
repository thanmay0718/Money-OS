package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record GoalContributionResponse(
        UUID id,
        UUID goalId,
        String goalTitle,
        UUID pocketId,
        String pocketName,
        BigDecimal amount,
        LocalDate contributionDate,
        String note,
        Instant createdAt,
        FinancialGoalResponse updatedGoal
) {}
