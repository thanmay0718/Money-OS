package com.moneyos.dto.response;

import com.moneyos.entity.TransactionType;

import java.time.Instant;
import java.util.UUID;

public record AdminCategoryResponse(
        UUID id,
        String name,
        TransactionType type,
        boolean active,
        String ownerEmail,
        String ownerName,
        Instant createdAt
) {}
