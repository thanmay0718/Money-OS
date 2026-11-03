package com.moneyos.service.impl;

import com.moneyos.dto.request.FinancialPreferencesRequest;
import com.moneyos.dto.request.FinancialProfileRequest;
import com.moneyos.dto.response.BudgetSuggestionDto;
import com.moneyos.dto.response.FinancialGoalResponse;
import com.moneyos.dto.response.FinancialProfileResponse;
import com.moneyos.entity.User;
import com.moneyos.entity.UserFinancialProfile;
import com.moneyos.enums.OnboardingStep;
import com.moneyos.repository.UserFinancialProfileRepository;
import com.moneyos.service.BudgetService;
import com.moneyos.service.FinancialGoalService;
import com.moneyos.service.FinancialProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FinancialProfileServiceImpl implements FinancialProfileService {

    private final UserFinancialProfileRepository repository;
    private final BudgetService budgetService;
    private final FinancialGoalService goalService;

    @Override
    @Transactional
    public FinancialProfileResponse getProfile(User user) {
        UserFinancialProfile profile = repository.findByUserId(user.getId())
                .orElseGet(() -> repository.save(new UserFinancialProfile(user)));
        BudgetSuggestionDto budgetSuggestion = budgetService.getBudgetSuggestion(user);
        List<FinancialGoalResponse> goalProgress = goalService.getGoalsForUser(user.getId());
        return toResponse(profile, budgetSuggestion, goalProgress);
    }

    @Override
    @Transactional
    public FinancialProfileResponse updateProfile(User user, FinancialProfileRequest request) {
        UserFinancialProfile profile = findOrCreate(user);
        profile.setProfessionalStage(request.professionalStage());
        profile.setEmploymentType(request.employmentType());
        profile.setIndustry(request.industry());
        profile.setIncomePattern(request.incomePattern());
        profile.setIncomeCurrency(request.incomeCurrency());
        profile.setEstimatedMonthlyIncome(request.estimatedMonthlyIncome());
        profile.setLivingArrangement(request.livingArrangement());
        profile.setBudgetingStyle(request.budgetingStyle());
        profile.setPreferredReviewFrequency(request.preferredReviewFrequency());
        if (request.notificationsEnabled() != null) profile.setNotificationsEnabled(request.notificationsEnabled());
        profile.setPreferredCurrency(request.preferredCurrency());
        if (request.personalizationEnabled() != null) profile.setPersonalizationEnabled(request.personalizationEnabled());
        UserFinancialProfile saved = repository.save(profile);
        BudgetSuggestionDto budgetSuggestion = budgetService.getBudgetSuggestion(user);
        List<FinancialGoalResponse> goalProgress = goalService.getGoalsForUser(user.getId());
        return toResponse(saved, budgetSuggestion, goalProgress);
    }

    @Override
    @Transactional
    public FinancialProfileResponse updatePreferences(User user, FinancialPreferencesRequest request) {
        UserFinancialProfile profile = findOrCreate(user);
        profile.setPreferredReviewFrequency(request.preferredReviewFrequency());
        if (request.notificationsEnabled() != null) profile.setNotificationsEnabled(request.notificationsEnabled());
        profile.setPreferredCurrency(request.preferredCurrency());
        if (request.personalizationEnabled() != null) profile.setPersonalizationEnabled(request.personalizationEnabled());
        UserFinancialProfile saved = repository.save(profile);
        BudgetSuggestionDto budgetSuggestion = budgetService.getBudgetSuggestion(user);
        List<FinancialGoalResponse> goalProgress = goalService.getGoalsForUser(user.getId());
        return toResponse(saved, budgetSuggestion, goalProgress);
    }

    @Override
    @Transactional
    public FinancialProfileResponse completeOnboarding(User user) {
        UserFinancialProfile profile = findOrCreate(user);
        profile.setOnboardingCompleted(true);
        profile.setOnboardingStep("complete");
        UserFinancialProfile saved = repository.save(profile);
        BudgetSuggestionDto budgetSuggestion = budgetService.getBudgetSuggestion(user);
        List<FinancialGoalResponse> goalProgress = goalService.getGoalsForUser(user.getId());
        return toResponse(saved, budgetSuggestion, goalProgress);
    }

    @Override
    @Transactional
    public FinancialProfileResponse saveOnboardingStep(User user, OnboardingStep step) {
        UserFinancialProfile profile = findOrCreate(user);
        profile.setOnboardingStepEnum(step);
        // Optionally update the legacy string for backward compatibility
        profile.setOnboardingStep(step.name().toLowerCase());
        UserFinancialProfile saved = repository.save(profile);
        BudgetSuggestionDto budgetSuggestion = budgetService.getBudgetSuggestion(user);
        List<FinancialGoalResponse> goalProgress = goalService.getGoalsForUser(user.getId());
        return toResponse(saved, budgetSuggestion, goalProgress);
    }

    private UserFinancialProfile findOrCreate(User user) {
        return repository.findByUserId(user.getId())
                .orElseGet(() -> new UserFinancialProfile(user));
    }

    private FinancialProfileResponse toResponse(UserFinancialProfile profile, BudgetSuggestionDto budgetSuggestion, List<FinancialGoalResponse> goalProgress) {
        return new FinancialProfileResponse(
                profile.getId(),
                profile.getProfessionalStage(),
                profile.getEmploymentType(),
                profile.getIndustry(),
                profile.getIncomePattern(),
                profile.getIncomeCurrency(),
                profile.getEstimatedMonthlyIncome(),
                profile.getLivingArrangement(),
                profile.getBudgetingStyle(),
                profile.getPreferredReviewFrequency(),
                profile.isNotificationsEnabled(),
                profile.getPreferredCurrency(),
                profile.isPersonalizationEnabled(),
                profile.isOnboardingCompleted(),
                profile.getOnboardingStepEnum(),
                profile.getOnboardingStep(),
                profile.getCreatedAt(),
                profile.getUpdatedAt(),
                budgetSuggestion,
                goalProgress
        );
    }
}
