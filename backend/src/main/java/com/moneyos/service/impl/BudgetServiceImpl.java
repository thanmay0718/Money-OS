package com.moneyos.service.impl;

import com.moneyos.dto.response.BudgetSuggestionDto;
import com.moneyos.dto.response.DashboardSummaryResponse;
import com.moneyos.dto.response.MoneyPocketResponse;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.entity.UserFinancialProfile;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserFinancialProfileRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.BudgetService;
import com.moneyos.service.MoneyPocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final TransactionRepository transactionRepository;
    private final UserFinancialProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final MoneyPocketService moneyPocketService;

    @Override
    @Transactional(readOnly = true)
    public BudgetSuggestionDto getBudgetSuggestion(User user) {
        return calculateBudget(user.getId(), user.getCurrency());
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetSuggestionDto getBudgetSuggestion(UUID userId) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return calculateBudget(user.getId(), user.getCurrency());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(UUID userId) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String currency = (user.getCurrency() != null && !user.getCurrency().isBlank()) ? user.getCurrency() : "INR";

        // 1. Total Balance across all active pockets
        BigDecimal totalBalance = moneyPocketService.getMyPockets(userId).stream()
                .map(MoneyPocketResponse::balance)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Dates for Current Month and Previous Month
        YearMonth currentYearMonth = YearMonth.now();
        LocalDate curStart = currentYearMonth.atDay(1);
        LocalDate curEnd = currentYearMonth.atEndOfMonth();

        YearMonth prevYearMonth = currentYearMonth.minusMonths(1);
        LocalDate prevStart = prevYearMonth.atDay(1);
        LocalDate prevEnd = prevYearMonth.atEndOfMonth();

        // 3. Current & Previous Income
        BigDecimal curIncome = transactionRepository.sumVolumeByUserIdTypeAndDateRange(userId, TransactionType.INCOME, curStart, curEnd);
        if (curIncome == null) curIncome = BigDecimal.ZERO;

        BigDecimal prevIncome = transactionRepository.sumVolumeByUserIdTypeAndDateRange(userId, TransactionType.INCOME, prevStart, prevEnd);
        if (prevIncome == null) prevIncome = BigDecimal.ZERO;

        BigDecimal incomeChangePct = calculatePercentageChange(prevIncome, curIncome);

        // 4. Current & Previous Expenses
        BigDecimal curExpense = transactionRepository.sumVolumeByUserIdTypeAndDateRange(userId, TransactionType.EXPENSE, curStart, curEnd);
        if (curExpense == null) curExpense = BigDecimal.ZERO;

        BigDecimal prevExpense = transactionRepository.sumVolumeByUserIdTypeAndDateRange(userId, TransactionType.EXPENSE, prevStart, prevEnd);
        if (prevExpense == null) prevExpense = BigDecimal.ZERO;

        BigDecimal expenseChangePct = calculatePercentageChange(prevExpense, curExpense);

        // 5. Savings Rate: (Income - Expenses) / Income * 100
        BigDecimal curSavingsRate = BigDecimal.ZERO;
        if (curIncome.compareTo(BigDecimal.ZERO) > 0) {
            curSavingsRate = curIncome.subtract(curExpense)
                    .divide(curIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);
        }

        BigDecimal prevSavingsRate = BigDecimal.ZERO;
        if (prevIncome.compareTo(BigDecimal.ZERO) > 0) {
            prevSavingsRate = prevIncome.subtract(prevExpense)
                    .divide(prevIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);
        }

        BigDecimal savingsRateChange = curSavingsRate.subtract(prevSavingsRate);

        // 6. Balance Change: Net cash flow of current month vs previous month
        BigDecimal prevNetCashFlow = prevIncome.subtract(prevExpense);
        BigDecimal curNetCashFlow = curIncome.subtract(curExpense);
        BigDecimal balanceChangePct = calculatePercentageChange(prevNetCashFlow.abs(), curNetCashFlow.abs());
        if (curNetCashFlow.compareTo(prevNetCashFlow) < 0 && balanceChangePct.compareTo(BigDecimal.ZERO) > 0) {
            balanceChangePct = balanceChangePct.negate();
        }

        // 7. Category Breakdown for current month
        List<Object[]> rawCategoryExpenses = transactionRepository.sumExpensesByCategoryAndDateRange(userId, curStart, curEnd);
        List<DashboardSummaryResponse.CategoryExpenseDto> categoryExpenses = new ArrayList<>();
        BigDecimal totalCategorySpent = curExpense;

        for (Object[] row : rawCategoryExpenses) {
            UUID catId = (UUID) row[0];
            String catName = (String) row[1];
            BigDecimal amount = (BigDecimal) row[2];
            BigDecimal pct = BigDecimal.ZERO;
            if (totalCategorySpent.compareTo(BigDecimal.ZERO) > 0) {
                pct = amount.divide(totalCategorySpent, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP);
            }
            categoryExpenses.add(new DashboardSummaryResponse.CategoryExpenseDto(catId, catName, amount, pct));
        }

        // 8. Daily cash flow points for last 30 days
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Object[]> rawCashFlow = transactionRepository.sumDailyCashFlowByUserIdAndDateRange(userId, thirtyDaysAgo, LocalDate.now());
        Map<LocalDate, BigDecimal[]> cashFlowMap = new LinkedHashMap<>();

        for (LocalDate d = thirtyDaysAgo; !d.isAfter(LocalDate.now()); d = d.plusDays(1)) {
            cashFlowMap.put(d, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
        }

        for (Object[] row : rawCashFlow) {
            LocalDate date = (LocalDate) row[0];
            TransactionType type = (TransactionType) row[1];
            BigDecimal amount = (BigDecimal) row[2];

            BigDecimal[] entry = cashFlowMap.computeIfAbsent(date, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            if (type == TransactionType.INCOME) {
                entry[0] = entry[0].add(amount);
            } else if (type == TransactionType.EXPENSE) {
                entry[1] = entry[1].add(amount);
            }
        }

        List<DashboardSummaryResponse.CashFlowPointDto> cashFlowPoints = cashFlowMap.entrySet().stream()
                .map(e -> new DashboardSummaryResponse.CashFlowPointDto(
                        e.getKey(),
                        e.getValue()[0],
                        e.getValue()[1],
                        e.getValue()[0].subtract(e.getValue()[1])
                ))
                .toList();

        String periodName = currentYearMonth.getMonth().name().charAt(0) +
                currentYearMonth.getMonth().name().substring(1).toLowerCase() + " " + currentYearMonth.getYear();

        return new DashboardSummaryResponse(
                totalBalance,
                balanceChangePct,
                curIncome,
                prevIncome,
                incomeChangePct,
                curExpense,
                prevExpense,
                expenseChangePct,
                curSavingsRate,
                prevSavingsRate,
                savingsRateChange,
                currency,
                periodName,
                categoryExpenses,
                cashFlowPoints
        );
    }

    private BigDecimal calculatePercentageChange(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return (current != null && current.compareTo(BigDecimal.ZERO) > 0) ? BigDecimal.valueOf(100.0) : BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Calculates a user-scoped budget projection.
     *
     * <p><strong>Financial Calculations:</strong></p>
     * <ul>
     *   <li><strong>estimatedMonthlyIncome</strong>: retrieved from the user's financial profile.
     *       If not set, defaults to 0.</li>
     *   <li><strong>recordedIncome</strong>: sum of the user's {@link TransactionType#INCOME} transactions.
     *       Scoped strictly to the authenticated user's ID; null sums treated as 0.</li>
     *   <li><strong>recordedExpense</strong>: sum of the user's {@link TransactionType#EXPENSE} transactions.
     *       Scoped strictly to the authenticated user's ID; null sums treated as 0.</li>
     *   <li><strong>transfers</strong>: {@link TransactionType#TRANSFER} transactions are explicitly excluded.</li>
     *   <li><strong>availableToSpend</strong>: {@code estimatedMonthlyIncome - expenses recorded in the current
     *       calendar month}. The value is null unless the estimated income is positive. It is a planning estimate,
     *       not a cash balance, and neither pocket balances nor standalone obligations are invented.</li>
     * </ul>
     */
    private BudgetSuggestionDto calculateBudget(UUID userId, String userCurrency) {
        // 1. User's self-reported estimated monthly income from financial profile
        BigDecimal estimatedIncome = profileRepository.findByUserId(userId)
                .map(UserFinancialProfile::getEstimatedMonthlyIncome)
                .filter(inc -> inc != null && inc.compareTo(BigDecimal.ZERO) >= 0)
                .orElse(BigDecimal.ZERO);

        // 2. Query user-scoped recorded income and expenses (excludes TRANSFER and other users)
        BigDecimal recordedIncome = transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.INCOME);
        if (recordedIncome == null) {
            recordedIncome = BigDecimal.ZERO;
        }

        BigDecimal recordedExpense = transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.EXPENSE);
        if (recordedExpense == null) {
            recordedExpense = BigDecimal.ZERO;
        }

        // 3. A planning estimate is only trustworthy when a positive monthly income estimate exists.
        // Expenses are deliberately limited to the current calendar month; this is not a cash balance.
        YearMonth currentMonth = YearMonth.now();
        LocalDate periodStart = currentMonth.atDay(1);
        LocalDate periodEnd = currentMonth.atEndOfMonth();
        BigDecimal monthlyExpense = transactionRepository.sumVolumeByUserIdTypeAndDateRange(
                userId, TransactionType.EXPENSE, periodStart, periodEnd
        );
        if (monthlyExpense == null) {
            monthlyExpense = BigDecimal.ZERO;
        }

        BigDecimal availableToSpend = estimatedIncome.compareTo(BigDecimal.ZERO) > 0
                ? estimatedIncome.subtract(monthlyExpense)
                : null;
        String calculationPeriod = periodStart + " to " + periodEnd;

        String currency = (userCurrency != null && !userCurrency.isBlank()) ? userCurrency : "INR";

        return new BudgetSuggestionDto(
                estimatedIncome,
                recordedIncome,
                recordedExpense,
                availableToSpend,
                calculationPeriod,
                currency
        );
    }

    @Override
    @Transactional(readOnly = true)
    public com.moneyos.dto.response.EmergencyFundResponse getEmergencyFund(UUID userId, Integer targetMonths) {
        int months = (targetMonths != null && targetMonths > 0) ? targetMonths : 6;

        LocalDate now = LocalDate.now();
        LocalDate ninetyDaysAgo = now.minusDays(90);

        BigDecimal total90DayExpenses = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, ninetyDaysAgo, now);
        if (total90DayExpenses == null) {
            total90DayExpenses = BigDecimal.ZERO;
        }

        BigDecimal averageMonthlyExpenses = total90DayExpenses.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
        if (averageMonthlyExpenses.compareTo(BigDecimal.ZERO) <= 0) {
            YearMonth ym = YearMonth.now();
            BigDecimal currentMonthExp = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                    userId, TransactionType.EXPENSE, ym.atDay(1), ym.atEndOfMonth());
            averageMonthlyExpenses = currentMonthExp != null ? currentMonthExp : BigDecimal.ZERO;
        }
        if (averageMonthlyExpenses.compareTo(BigDecimal.ZERO) <= 0) {
            averageMonthlyExpenses = BigDecimal.valueOf(15000);
        }

        BigDecimal recommendedTarget = averageMonthlyExpenses.multiply(BigDecimal.valueOf(months));

        List<MoneyPocketResponse> pockets = moneyPocketService.getMyPockets(userId);
        BigDecimal emergencySavings = BigDecimal.ZERO;
        boolean hasDedicatedEmergencyPocket = false;

        if (pockets != null) {
            for (MoneyPocketResponse p : pockets) {
                if (p.active() && p.balance() != null) {
                    String name = p.name().toLowerCase();
                    if (name.contains("emergency") || name.contains("buffer") || name.contains("safety")) {
                        emergencySavings = emergencySavings.add(p.balance());
                        hasDedicatedEmergencyPocket = true;
                    }
                }
            }
            if (!hasDedicatedEmergencyPocket) {
                for (MoneyPocketResponse p : pockets) {
                    if (p.active() && p.balance() != null) {
                        emergencySavings = emergencySavings.add(p.balance());
                    }
                }
            }
        }

        BigDecimal coverageMonths = BigDecimal.ZERO;
        if (averageMonthlyExpenses.compareTo(BigDecimal.ZERO) > 0) {
            coverageMonths = emergencySavings.divide(averageMonthlyExpenses, 1, RoundingMode.HALF_UP);
        }

        BigDecimal progressPct = BigDecimal.ZERO;
        if (recommendedTarget.compareTo(BigDecimal.ZERO) > 0) {
            progressPct = emergencySavings.multiply(BigDecimal.valueOf(100))
                    .divide(recommendedTarget, 1, RoundingMode.HALF_UP);
        }

        BigDecimal shortfall = recommendedTarget.subtract(emergencySavings);
        BigDecimal suggestedMonthlyContribution = shortfall.compareTo(BigDecimal.ZERO) > 0
                ? shortfall.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String statusNote;
        if (coverageMonths.compareTo(BigDecimal.valueOf(months)) >= 0) {
            statusNote = "Fully funded! You have " + coverageMonths + " months of living expenses secured.";
        } else if (coverageMonths.compareTo(BigDecimal.valueOf(3)) >= 0) {
            statusNote = "Solid baseline (" + coverageMonths + " months of expense runway).";
        } else if (coverageMonths.compareTo(BigDecimal.ONE) >= 0) {
            statusNote = "Basic buffer (" + coverageMonths + " months). Building toward " + months + " months recommended.";
        } else {
            statusNote = "Runway low (" + coverageMonths + " months). Building toward " + months + " months recommended.";
        }

        return new com.moneyos.dto.response.EmergencyFundResponse(
                emergencySavings,
                averageMonthlyExpenses,
                months,
                recommendedTarget,
                coverageMonths,
                progressPct,
                suggestedMonthlyContribution,
                statusNote
        );
    }
}
