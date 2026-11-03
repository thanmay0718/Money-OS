package com.moneyos.service;

import com.moneyos.dto.request.FinancialGoalRequest;
import com.moneyos.dto.response.FinancialGoalResponse;
import com.moneyos.entity.User;

import java.util.List;
import java.util.UUID;

public interface FinancialGoalService {

    List<FinancialGoalResponse> getGoalsForUser(UUID userId);

    FinancialGoalResponse createGoal(User user, FinancialGoalRequest request);

    FinancialGoalResponse updateGoal(UUID userId, UUID goalId, FinancialGoalRequest request);

    void deleteGoal(UUID userId, UUID goalId);
}
