package com.moneyos.dto.response;

import com.moneyos.enums.NetWorthType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record NetWorthItemResponse(
        UUID id,
        String name,
        NetWorthType type,
        String category,
        BigDecimal amount,
        Instant createdAt,
        Instant updatedAt
) {}
