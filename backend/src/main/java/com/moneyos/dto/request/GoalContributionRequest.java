package com.moneyos.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record GoalContributionRequest(
        @NotNull(message = "Source pocket is required")
        UUID pocketId,

        @NotNull(message = "Contribution amount is required")
        @DecimalMin(value = "0.01", message = "Contribution amount must be greater than zero")
        @Digits(integer = 15, fraction = 2, message = "Amount cannot have more than 2 decimal places")
        BigDecimal amount,

        LocalDate contributionDate,

        @Size(max = 255, message = "Note cannot exceed 255 characters")
        String note,

        @Size(max = 64, message = "Idempotency key cannot exceed 64 characters")
        String idempotencyKey
) {}
