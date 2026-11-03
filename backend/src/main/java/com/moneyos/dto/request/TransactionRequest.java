package com.moneyos.dto.request;

import com.moneyos.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionRequest(

        @NotNull(message = "Transaction type is required")
        TransactionType type,

        @NotNull(message = "Amount is required")
        @DecimalMin(
                value = "0.01",
                message = "Amount must be greater than zero"
        )
        BigDecimal amount,

        @NotBlank(message = "Description is required")
        @Size(
                max = 150,
                message = "Description cannot exceed 150 characters"
        )
        String description,

        UUID categoryId,

        UUID fromPocketId,

        UUID toPocketId,

        @NotNull(message = "Transaction date is required")
        LocalDate transactionDate,

        UUID goalId,

        @DecimalMin(value = "0.01", message = "Goal contribution amount must be greater than zero")
        BigDecimal goalContributionAmount,

        @Size(max = 255, message = "Goal contribution note cannot exceed 255 characters")
        String goalContributionNote

) {
    public TransactionRequest(
            TransactionType type,
            BigDecimal amount,
            String description,
            UUID categoryId,
            UUID fromPocketId,
            UUID toPocketId,
            LocalDate transactionDate
    ) {
        this(type, amount, description, categoryId, fromPocketId, toPocketId, transactionDate, null, null, null);
    }
}
