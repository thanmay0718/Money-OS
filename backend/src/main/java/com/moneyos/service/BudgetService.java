package com.moneyos.service;

import com.moneyos.dto.response.BudgetSuggestionDto;
import com.moneyos.dto.response.DashboardSummaryResponse;
import com.moneyos.dto.response.EmergencyFundResponse;
import com.moneyos.entity.User;

import java.util.UUID;

public interface BudgetService {

    BudgetSuggestionDto getBudgetSuggestion(User user);

    BudgetSuggestionDto getBudgetSuggestion(UUID userId);

    DashboardSummaryResponse getDashboardSummary(UUID userId);

    EmergencyFundResponse getEmergencyFund(UUID userId, Integer targetMonths);
}
