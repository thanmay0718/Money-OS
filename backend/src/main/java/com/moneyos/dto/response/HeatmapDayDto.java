package com.moneyos.dto.response;

import java.math.BigDecimal;

public record HeatmapDayDto(
        String date,
        long activityCount,
        long transactionCount,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal goalContributions,
        int intensity
) {}
