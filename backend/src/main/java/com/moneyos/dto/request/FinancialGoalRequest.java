package com.moneyos.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FinancialGoalRequest(
        @NotBlank(message = "Goal title is required")
        @Size(max = 100, message = "Goal title cannot exceed 100 characters")
        String title,

        @NotNull(message = "Target amount is required")
        @DecimalMin(value = "0.01", message = "Target amount must be greater than zero")
        BigDecimal targetAmount,

        @DecimalMin(value = "0.0", message = "Saved amount cannot be negative")
        BigDecimal savedAmount,

        @Size(max = 3, message = "Currency code must be 3 characters")
        String currency,

        LocalDate targetDate
) {}
