
package com.moneyos.dto.response;

import java.time.Instant;
import java.util.UUID;

public record MoneyPocketResponse(
        UUID id,
        String name,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
