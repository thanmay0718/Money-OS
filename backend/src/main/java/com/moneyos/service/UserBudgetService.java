package com.moneyos.service;

import com.moneyos.dto.request.BudgetRequest;
import com.moneyos.dto.response.BudgetResponse;
import com.moneyos.entity.User;

import java.util.List;
import java.util.UUID;

public interface UserBudgetService {

    List<BudgetResponse> getBudgetsForMonth(UUID userId, String month);

    BudgetResponse createBudget(User user, BudgetRequest request);

    BudgetResponse updateBudget(UUID userId, UUID budgetId, BudgetRequest request);

    void deleteBudget(UUID userId, UUID budgetId);
}
