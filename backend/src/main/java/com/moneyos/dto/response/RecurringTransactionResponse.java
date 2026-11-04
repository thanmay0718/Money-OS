package com.moneyos.dto.response;

import com.moneyos.entity.TransactionType;
import com.moneyos.enums.BillStatus;
import com.moneyos.enums.Frequency;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RecurringTransactionResponse(
        UUID id,
        String name,
        BigDecimal amount,
        UUID categoryId,
        String categoryName,
        TransactionType type,
        Frequency frequency,
        LocalDate startDate,
        LocalDate nextDueDate,
        UUID pocketId,
        String pocketName,
        boolean active,
        boolean isBill,
        BillStatus billStatus,
        long daysRemaining,
        LocalDate lastPaidDate,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {}
