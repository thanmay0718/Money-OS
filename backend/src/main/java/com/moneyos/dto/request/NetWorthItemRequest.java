package com.moneyos.dto.request;

import com.moneyos.enums.NetWorthType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record NetWorthItemRequest(
        @NotBlank(message = "Item name is required")
        @Size(max = 100, message = "Item name cannot exceed 100 characters")
        String name,

        @NotNull(message = "Type is required")
        NetWorthType type, // ASSET or LIABILITY

        String category, // e.g. INVESTMENT, PROPERTY, VEHICLE, CASH, CREDIT_CARD, etc.

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.00", message = "Amount cannot be negative")
        BigDecimal amount
) {}
