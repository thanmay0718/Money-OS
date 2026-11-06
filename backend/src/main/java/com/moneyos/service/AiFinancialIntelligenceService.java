package com.moneyos.service;

import com.moneyos.dto.request.AiChatRequest;
import com.moneyos.dto.response.AiChatResponse;
import com.moneyos.dto.response.AiInsightResponse;
import com.moneyos.dto.response.BudgetRecommendationResponse;
import com.moneyos.dto.response.CashflowForecastResponse;

import java.util.List;
import java.util.UUID;

public interface AiFinancialIntelligenceService {

    List<AiInsightResponse> generateInsights(UUID userId);

    CashflowForecastResponse getCashflowForecast(UUID userId);

    List<BudgetRecommendationResponse> getBudgetRecommendations(UUID userId);

    AiChatResponse askCopilot(UUID userId, AiChatRequest request);
}
