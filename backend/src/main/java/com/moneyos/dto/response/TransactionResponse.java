package com.moneyos.dto.response;

import com.moneyos.entity.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionResponse(

        UUID id,

        TransactionType type,

        BigDecimal amount,

        String description,

        UUID categoryId,

        String categoryName,

        UUID fromPocketId,

        String fromPocketName,

        UUID toPocketId,

        String toPocketName,

        LocalDate transactionDate,

        Instant createdAt,

        GoalContributionResponse goalContribution

) {
    public TransactionResponse(
            UUID id,
            TransactionType type,
            BigDecimal amount,
            String description,
            UUID categoryId,
            String categoryName,
            UUID fromPocketId,
            String fromPocketName,
            UUID toPocketId,
            String toPocketName,
            LocalDate transactionDate,
            Instant createdAt
    ) {
        this(id, type, amount, description, categoryId, categoryName, fromPocketId, fromPocketName, toPocketId, toPocketName, transactionDate, createdAt, null);
    }
}
