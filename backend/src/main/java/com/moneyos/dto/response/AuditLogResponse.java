package com.moneyos.dto.response;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        String eventType,
        String actorEmail,
        String targetResource,
        String details,
        Instant timestamp
) {}
