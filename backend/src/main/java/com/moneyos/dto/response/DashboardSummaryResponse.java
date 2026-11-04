package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Authoritative financial summary for the MoneyOS Dashboard overview.
 */
public record DashboardSummaryResponse(
        BigDecimal totalBalance,
        BigDecimal balanceChangePercentage,
        BigDecimal currentMonthIncome,
        BigDecimal previousMonthIncome,
        BigDecimal incomeChangePercentage,
        BigDecimal currentMonthExpense,
        BigDecimal previousMonthExpense,
        BigDecimal expenseChangePercentage,
        BigDecimal currentSavingsRate,
        BigDecimal previousSavingsRate,
        BigDecimal savingsRateChange,
        String currency,
        String periodName,
        List<CategoryExpenseDto> categoryExpenses,
        List<CashFlowPointDto> cashFlowPoints
) {
    public record CategoryExpenseDto(
            UUID categoryId,
            String categoryName,
            BigDecimal amount,
            BigDecimal percentage
    ) {}

    public record CashFlowPointDto(
            LocalDate date,
            BigDecimal income,
            BigDecimal expense,
            BigDecimal net
    ) {}
}
