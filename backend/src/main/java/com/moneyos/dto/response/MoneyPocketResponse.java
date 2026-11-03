package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MoneyPocketResponse(
        UUID id,
        String name,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        BigDecimal balance
) {
    public MoneyPocketResponse(
            UUID id,
            String name,
            boolean active,
            Instant createdAt,
            Instant updatedAt
    ) {
        this(id, name, active, createdAt, updatedAt, BigDecimal.ZERO);
    }
}
