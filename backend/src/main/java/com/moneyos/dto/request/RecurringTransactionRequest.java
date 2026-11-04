package com.moneyos.dto.request;

import com.moneyos.entity.TransactionType;
import com.moneyos.enums.Frequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RecurringTransactionRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name cannot exceed 150 characters")
        String name,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        UUID categoryId,

        TransactionType type, // INCOME or EXPENSE

        Frequency frequency, // DAILY, WEEKLY, MONTHLY, YEARLY

        LocalDate startDate,

        LocalDate nextDueDate,

        UUID pocketId,

        Boolean active,

        Boolean isBill,

        String notes
) {}
