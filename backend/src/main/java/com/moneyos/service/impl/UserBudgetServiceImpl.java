package com.moneyos.service.impl;

import com.moneyos.dto.request.BudgetRequest;
import com.moneyos.dto.response.BudgetResponse;
import com.moneyos.entity.Budget;
import com.moneyos.entity.Category;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.enums.BudgetStatus;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.BudgetRepository;
import com.moneyos.repository.CategoryRepository;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.service.FinancialActivityService;
import com.moneyos.service.UserBudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserBudgetServiceImpl implements UserBudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final FinancialActivityService financialActivityService;

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgetsForMonth(UUID userId, String month) {
        String activeMonth = (month != null && !month.isBlank())
                ? month.trim()
                : LocalDate.now().toString().substring(0, 7);

        YearMonth ym;
        try {
            ym = YearMonth.parse(activeMonth);
        } catch (Exception e) {
            ym = YearMonth.now();
            activeMonth = ym.toString();
        }

        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Budget> budgets = budgetRepository.findAllByUserIdAndMonthOrderByCreatedAtDesc(userId, activeMonth);

        return budgets.stream()
                .map(b -> toResponse(b, userId, startDate, endDate))
                .toList();
    }

    @Override
    @Transactional
    public BudgetResponse createBudget(User user, BudgetRequest request) {
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Budget amount must be greater than zero");
        }

        String activeMonth = (request.month() != null && !request.month().isBlank())
                ? request.month().trim()
                : LocalDate.now().toString().substring(0, 7);

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

            Optional<Budget> existing = budgetRepository.findByUserIdAndMonthAndCategoryId(
                    user.getId(), activeMonth, request.categoryId());
            if (existing.isPresent()) {
                Budget b = existing.get();
                b.setAmount(request.amount());
                if (request.name() != null && !request.name().isBlank()) {
                    b.setName(request.name().trim());
                }
                Budget saved = budgetRepository.save(b);
                financialActivityService.recordBudgetUpdatedActivity(user.getId(), saved);
                YearMonth ym = YearMonth.parse(activeMonth);
                return toResponse(saved, user.getId(), ym.atDay(1), ym.atEndOfMonth());
            }
        }

        String name = (request.name() != null && !request.name().isBlank())
                ? request.name().trim()
                : (category != null ? category.getName() + " Budget" : "Monthly Budget");

        Budget budget = new Budget(user, category, name, request.amount(), activeMonth);
        Budget saved = budgetRepository.save(budget);
        financialActivityService.recordBudgetCreatedActivity(user.getId(), saved);

        YearMonth ym = YearMonth.parse(activeMonth);
        return toResponse(saved, user.getId(), ym.atDay(1), ym.atEndOfMonth());
    }

    @Override
    @Transactional
    public BudgetResponse updateBudget(UUID userId, UUID budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        if (request.amount() != null && request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Budget amount must be greater than zero");
        }

        if (request.amount() != null) {
            budget.setAmount(request.amount());
        }
        if (request.name() != null && !request.name().isBlank()) {
            budget.setName(request.name().trim());
        }
        if (request.categoryId() != null) {
            Category cat = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            budget.setCategory(cat);
        }

        Budget saved = budgetRepository.save(budget);
        financialActivityService.recordBudgetUpdatedActivity(userId, saved);
        YearMonth ym = YearMonth.parse(saved.getMonth());
        return toResponse(saved, userId, ym.atDay(1), ym.atEndOfMonth());
    }

    @Override
    @Transactional
    public void deleteBudget(UUID userId, UUID budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private BudgetResponse toResponse(Budget budget, UUID userId, LocalDate startDate, LocalDate endDate) {
        BigDecimal spent;
        if (budget.getCategory() != null) {
            spent = transactionRepository.sumExpensesByCategoryIdAndDateRange(
                    userId, budget.getCategory().getId(), startDate, endDate);
        } else {
            spent = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                    userId, TransactionType.EXPENSE, startDate, endDate);
        }

        if (spent == null) {
            spent = BigDecimal.ZERO;
        }

        BigDecimal budgetAmount = budget.getAmount() != null ? budget.getAmount() : BigDecimal.ZERO;
        BigDecimal remaining = budgetAmount.subtract(spent);

        BigDecimal utilizationPct = BigDecimal.ZERO;
        if (budgetAmount.compareTo(BigDecimal.ZERO) > 0) {
            utilizationPct = spent.multiply(BigDecimal.valueOf(100))
                    .divide(budgetAmount, 2, RoundingMode.HALF_UP);
        }

        BudgetStatus status;
        if (spent.compareTo(budgetAmount) > 0) {
            status = BudgetStatus.EXCEEDED;
        } else if (utilizationPct.compareTo(BigDecimal.valueOf(80)) >= 0) {
            status = BudgetStatus.WARNING;
        } else {
            status = BudgetStatus.NORMAL;
        }

        return new BudgetResponse(
                budget.getId(),
                budget.getName(),
                budget.getCategory() != null ? budget.getCategory().getId() : null,
                budget.getCategory() != null ? budget.getCategory().getName() : "All Categories",
                budgetAmount,
                spent,
                remaining,
                utilizationPct,
                status,
                budget.getMonth(),
                budget.getCreatedAt(),
                budget.getUpdatedAt()
        );
    }
}
