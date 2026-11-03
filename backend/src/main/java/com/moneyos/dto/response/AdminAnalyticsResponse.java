package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record AdminAnalyticsResponse(
        List<DailyMetric> timeline
) {
    public record DailyMetric(
            String date,
            long transactionsCount,
            BigDecimal totalVolume,
            BigDecimal incomeVolume,
            BigDecimal expenseVolume,
            BigDecimal transferVolume,
            long newUsers
    ) {}
}
