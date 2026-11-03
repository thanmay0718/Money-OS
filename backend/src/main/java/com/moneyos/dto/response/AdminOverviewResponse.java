package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record AdminOverviewResponse(
        long totalUsers,
        long activeUsers,
        long deactivatedUsers,
        long totalTransactions,
        BigDecimal totalVolume,
        BigDecimal incomeVolume,
        BigDecimal expenseVolume,
        BigDecimal transferVolume,
        long incomeCount,
        long expenseCount,
        long transferCount,
        List<UserResponse> recentUsers,
        List<TransactionResponse> recentTransactions,
        List<AuditLogResponse> recentAuditLogs,
        String systemStatus
) {}
