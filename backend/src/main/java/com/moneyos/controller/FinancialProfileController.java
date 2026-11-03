package com.moneyos.controller;

import com.moneyos.dto.request.FinancialPreferencesRequest;
import com.moneyos.dto.request.FinancialProfileRequest;
import com.moneyos.dto.response.FinancialProfileResponse;
import com.moneyos.entity.User;
import com.moneyos.service.FinancialProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class FinancialProfileController {

    private final FinancialProfileService profileService;

    @GetMapping("/financial")
    public ResponseEntity<FinancialProfileResponse> getFinancialProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getProfile(user));
    }

    @PutMapping("/financial")
    public ResponseEntity<FinancialProfileResponse> updateFinancialProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody FinancialProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(user, request));
    }

    @PatchMapping("/financial/preferences")
    public ResponseEntity<FinancialProfileResponse> updatePreferences(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody FinancialPreferencesRequest request) {
        return ResponseEntity.ok(profileService.updatePreferences(user, request));
    }

    @PutMapping("/financial/onboarding/step/{step}")
    public ResponseEntity<FinancialProfileResponse> saveOnboardingStep(
            @AuthenticationPrincipal User user,
            @PathVariable String step) {
        // Convert path variable to enum, case insensitive
        com.moneyos.enums.OnboardingStep enumStep;
        try {
            enumStep = com.moneyos.enums.OnboardingStep.valueOf(step.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid onboarding step: " + step);
        }
        return ResponseEntity.ok(profileService.saveOnboardingStep(user, enumStep));
    }

    @PostMapping("/financial/onboarding/complete")
    public ResponseEntity<FinancialProfileResponse> completeOnboarding(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.completeOnboarding(user));
    }
}
