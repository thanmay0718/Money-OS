package com.moneyos.service;

import com.moneyos.dto.request.FinancialPreferencesRequest;
import com.moneyos.dto.request.FinancialProfileRequest;
import com.moneyos.dto.response.FinancialProfileResponse;
import com.moneyos.entity.User;

public interface FinancialProfileService {

    // Existing methods
    FinancialProfileResponse getProfile(User user);
    FinancialProfileResponse updateProfile(User user, FinancialProfileRequest request);
    FinancialProfileResponse updatePreferences(User user, FinancialPreferencesRequest request);
    FinancialProfileResponse completeOnboarding(User user);

    // New method for step persistence
    FinancialProfileResponse saveOnboardingStep(User user, com.moneyos.enums.OnboardingStep step);


}
