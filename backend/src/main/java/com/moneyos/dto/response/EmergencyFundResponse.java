package com.moneyos.dto.response;

import java.math.BigDecimal;

public record EmergencyFundResponse(
        BigDecimal currentEmergencySavings,
        BigDecimal averageMonthlyExpenses,
        int targetMonths,
        BigDecimal recommendedTargetAmount,
        BigDecimal coverageMonths,
        BigDecimal progressPercentage,
        BigDecimal suggestedMonthlyContribution,
        String statusNote
) {}
