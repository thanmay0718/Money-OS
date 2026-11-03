package com.moneyos.dto.response;

public record SystemHealthResponse(
        String status,
        boolean databaseConnected,
        long databaseLatencyMs,
        long uptimeSeconds,
        long jvmUsedMemoryMb,
        long jvmTotalMemoryMb,
        long jvmMaxMemoryMb,
        int availableProcessors,
        int activeThreadCount
) {}
