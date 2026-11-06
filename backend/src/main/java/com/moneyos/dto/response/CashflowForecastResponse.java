package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CashflowForecastResponse(
        BigDecimal currentTotalBalance,
        BigDecimal burnRateDaily,
        BigDecimal projectedEndOfMonthBalance,
        BigDecimal safeDailySpend,
        String currency,
        int daysRemainingInMonth,
        String forecastStatus, // SURPLUS, STABLE, AT_RISK
        String commentary,
        List<ForecastPoint> points
) {
    public record ForecastPoint(
            LocalDate date,
            BigDecimal balance,
            BigDecimal scheduledExpenses,
            boolean isUnderBuffer
    ) {}
}
