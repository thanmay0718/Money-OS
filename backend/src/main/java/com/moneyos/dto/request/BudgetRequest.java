package com.moneyos.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetRequest(
        @NotBlank(message = "Budget name is required")
        @Size(max = 100, message = "Budget name cannot exceed 100 characters")
        String name,

        UUID categoryId,

        @NotNull(message = "Budget amount is required")
        @DecimalMin(value = "0.01", message = "Budget amount must be greater than zero")
        BigDecimal amount,

        String month // Optional, defaults to current "YYYY-MM"
) {}
