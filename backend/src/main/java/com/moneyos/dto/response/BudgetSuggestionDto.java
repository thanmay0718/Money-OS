package com.moneyos.dto.response;

import java.math.BigDecimal;

/**
 * Budget suggestion and cash-flow planning projection.
 *
 * <p><strong>Financial Metric Definitions:</strong></p>
 * <ul>
 *   <li><strong>estimatedMonthlyIncome</strong>: User-supplied monthly income target. It is the only
 *       amount-based setup used for the monthly spendable estimate.</li>
 *   <li><strong>recordedIncome</strong>: Total sum of the authenticated user's {@code INCOME} transactions.
 *       Excludes {@code TRANSFER} and is presented for the dashboard's all-recorded period.</li>
 *   <li><strong>recordedExpense</strong>: Total sum of the authenticated user's {@code EXPENSE} transactions.
 *       Excludes {@code TRANSFER} and is presented for the dashboard's all-recorded period.</li>
 *   <li><strong>availableToSpend</strong>: A monthly planning estimate of
 *       {@code estimatedMonthlyIncome - recorded expenses in the current calendar month}. It is null unless
 *       estimated monthly income is greater than zero. It is not a bank or pocket balance, and does not include
 *       opening balances or obligations that are not modeled.</li>
 *   <li><strong>calculationPeriod</strong>: The inclusive date range used for the monthly expense subtraction.</li>
 *   <li><strong>currency</strong>: ISO-4217 currency code associated with the user profile (e.g., INR).</li>
 * </ul>
 */
public record BudgetSuggestionDto(
        BigDecimal estimatedMonthlyIncome,
        BigDecimal recordedIncome,
        BigDecimal recordedExpense,
        BigDecimal availableToSpend,
        String calculationPeriod,
        String currency
) {}
