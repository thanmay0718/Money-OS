package com.moneyos.controller;

import com.moneyos.dto.response.AchievementResponse;
import com.moneyos.dto.response.FinancialActivityResponse;
import com.moneyos.dto.response.GamificationOverviewResponse;
import com.moneyos.dto.response.HeatmapDayDto;
import com.moneyos.dto.response.OverviewSummaryResponse;
import com.moneyos.entity.User;
import com.moneyos.enums.ActivityType;
import com.moneyos.service.AchievementService;
import com.moneyos.service.FinancialActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/overview")
@RequiredArgsConstructor
public class OverviewController {

    private final FinancialActivityService financialActivityService;
    private final AchievementService achievementService;
    private final com.moneyos.service.CoinService coinService;

    @GetMapping("/rewards")
    public List<com.moneyos.dto.response.RewardItemResponse> getRewards(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return coinService.getAvailableRewards(userId);
    }

    @PostMapping("/rewards/redeem")
    public org.springframework.http.ResponseEntity<Void> redeemReward(
            Authentication authentication,
            @jakarta.validation.Valid @RequestBody com.moneyos.dto.request.RedeemRewardRequest request
    ) {
        UUID userId = extractUserId(authentication);
        coinService.redeemReward(userId, request.rewardCode());
        return org.springframework.http.ResponseEntity.ok().build();
    }

    @GetMapping("/gamification")
    public GamificationOverviewResponse getGamification(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return achievementService.getGamificationOverview(userId);
    }

    @PostMapping("/achievements/evaluate")
    public List<AchievementResponse> evaluateAchievements(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return achievementService.evaluateAchievements(userId);
    }

    @GetMapping("/summary")
    public OverviewSummaryResponse getSummary(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        UUID userId = extractUserId(authentication);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start = startDate != null ? startDate : end.minusDays(29);
        return financialActivityService.getSummary(userId, start, end);
    }

    @GetMapping("/heatmap")
    public List<HeatmapDayDto> getHeatmap(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        UUID userId = extractUserId(authentication);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start = startDate != null ? startDate : end.minusYears(1);
        return financialActivityService.getHeatmap(userId, start, end);
    }

    @GetMapping("/activities")
    public Page<FinancialActivityResponse> getTimeline(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) List<ActivityType> types,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "activityDate") Pageable pageable
    ) {
        UUID userId = extractUserId(authentication);
        return financialActivityService.getTimeline(userId, startDate, endDate, types, search, pageable);
    }

    @GetMapping("/activities/{id}")
    public FinancialActivityResponse getActivityDetail(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        UUID userId = extractUserId(authentication);
        return financialActivityService.getActivityDetail(userId, id);
    }

    @PostMapping("/backfill")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void triggerBackfill(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        financialActivityService.backfillActivitiesForUser(userId);
    }

    private UUID extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("Cannot extract user UUID from principal", e);
        }
    }
}
