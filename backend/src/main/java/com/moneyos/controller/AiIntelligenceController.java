package com.moneyos.controller;

import com.moneyos.dto.response.AiInsightResponse;
import com.moneyos.dto.response.BudgetRecommendationResponse;
import com.moneyos.dto.response.CashflowForecastResponse;
import com.moneyos.entity.User;
import com.moneyos.service.AiFinancialIntelligenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiIntelligenceController {

    private final AiFinancialIntelligenceService aiService;

    @GetMapping("/insights")
    public ResponseEntity<List<AiInsightResponse>> getInsights(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.generateInsights(user.getId()));
    }

    @GetMapping("/cashflow-forecast")
    public ResponseEntity<CashflowForecastResponse> getCashflowForecast(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.getCashflowForecast(user.getId()));
    }

    @GetMapping("/budget-recommendations")
    public ResponseEntity<List<BudgetRecommendationResponse>> getBudgetRecommendations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.getBudgetRecommendations(user.getId()));
    }

    @org.springframework.web.bind.annotation.PostMapping("/ask")
    public ResponseEntity<com.moneyos.dto.response.AiChatResponse> askCopilot(
            @AuthenticationPrincipal User user,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.moneyos.dto.request.AiChatRequest request
    ) {
        return ResponseEntity.ok(aiService.askCopilot(user.getId(), request));
    }
}
