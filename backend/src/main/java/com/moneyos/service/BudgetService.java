package com.moneyos.service;

import com.moneyos.dto.response.BudgetSuggestionDto;
import com.moneyos.entity.User;

import java.util.UUID;

public interface BudgetService {

    BudgetSuggestionDto getBudgetSuggestion(User user);

    BudgetSuggestionDto getBudgetSuggestion(UUID userId);
}
