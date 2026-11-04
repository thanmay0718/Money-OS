package com.moneyos.dto.response;

import com.moneyos.enums.ActivityReferenceType;
import com.moneyos.enums.ActivityType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FinancialActivityResponse(
        UUID id,
        ActivityType activityType,
        String title,
        String description,
        ActivityReferenceType referenceType,
        UUID referenceId,
        BigDecimal amount,
        LocalDate activityDate,
        Instant createdAt
) {}
