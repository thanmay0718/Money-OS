
package com.moneyos.dto.response;

import com.moneyos.entity.TransactionType;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        TransactionType type,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
