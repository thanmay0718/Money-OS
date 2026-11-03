package com.moneyos.service.impl;

import com.moneyos.dto.response.BudgetSuggestionDto;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.entity.UserFinancialProfile;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserFinancialProfileRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final TransactionRepository transactionRepository;
    private final UserFinancialProfileRepository profileRepository;
    private final UserRepository userRepository;

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
}
