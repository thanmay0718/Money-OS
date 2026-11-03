package com.moneyos.dto.response;

import com.moneyos.enums.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FinancialProfileResponse(
        UUID id,
        ProfessionalStage professionalStage,
        EmploymentType employmentType,
        String industry,
        IncomePattern incomePattern,
        String incomeCurrency,
        BigDecimal estimatedMonthlyIncome,
        LivingArrangement livingArrangement,
        BudgetingStyle budgetingStyle,
        ReviewFrequency preferredReviewFrequency,
        Boolean notificationsEnabled,
        String preferredCurrency,
        Boolean personalizationEnabled,
        Boolean onboardingCompleted,
        OnboardingStep onboardingStepEnum,
        String onboardingStep,
        Instant createdAt,
        Instant updatedAt,
        BudgetSuggestionDto budgetSuggestion,
        List<FinancialGoalResponse> goalProgress
) {
    /**
     * Backward-compatible constructor for existing callers that do not supply budgetSuggestion or goalProgress.
     */
    public FinancialProfileResponse(
            UUID id,
            ProfessionalStage professionalStage,
            EmploymentType employmentType,
            String industry,
            IncomePattern incomePattern,
            String incomeCurrency,
            BigDecimal estimatedMonthlyIncome,
            LivingArrangement livingArrangement,
            BudgetingStyle budgetingStyle,
            ReviewFrequency preferredReviewFrequency,
            Boolean notificationsEnabled,
            String preferredCurrency,
            Boolean personalizationEnabled,
            Boolean onboardingCompleted,
            OnboardingStep onboardingStepEnum,
            String onboardingStep,
            Instant createdAt,
            Instant updatedAt
    ) {
        this(
                id,
                professionalStage,
                employmentType,
                industry,
                incomePattern,
                incomeCurrency,
                estimatedMonthlyIncome,
                livingArrangement,
                budgetingStyle,
                preferredReviewFrequency,
                notificationsEnabled,
                preferredCurrency,
                personalizationEnabled,
                onboardingCompleted,
                onboardingStepEnum,
                onboardingStep,
                createdAt,
                updatedAt,
                null,
                null
        );
    }
}
