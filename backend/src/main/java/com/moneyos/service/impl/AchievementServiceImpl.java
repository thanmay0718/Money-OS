package com.moneyos.service.impl;

import com.moneyos.dto.response.AchievementResponse;
import com.moneyos.dto.response.GamificationOverviewResponse;
import com.moneyos.dto.response.StreakDetailsResponse;
import com.moneyos.entity.Budget;
import com.moneyos.entity.FinancialGoal;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.entity.UserAchievement;
import com.moneyos.enums.AchievementCode;
import com.moneyos.enums.GoalStatus;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.*;
import com.moneyos.service.AchievementService;
import com.moneyos.service.CoinService;
import com.moneyos.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AchievementServiceImpl implements AchievementService {

    private final UserAchievementRepository userAchievementRepository;
    private final TransactionRepository transactionRepository;
    private final GoalContributionRepository goalContributionRepository;
    private final FinancialGoalRepository financialGoalRepository;
    private final BudgetRepository budgetRepository;
    private final FinancialActivityRepository financialActivityRepository;
    private final UserRepository userRepository;
    private final StreakService streakService;
    private final CoinService coinService;

    @Override
    public GamificationOverviewResponse getGamificationOverview(UUID userId) {
        coinService.backfillTransactionCoins(userId);

        // Automatically evaluate achievements so their progress and coin rewards are current.
        List<AchievementResponse> newlyUnlocked = evaluateAchievements(userId);

        StreakDetailsResponse streakDetails = streakService.getStreakDetails(userId, LocalDate.now());
        int totalCoins = coinService.getBalance(userId);

        // Fetch all achievements in consistent order
        Map<AchievementCode, UserAchievement> map = userAchievementRepository.findByUser_Id(userId).stream()
                .collect(Collectors.toMap(UserAchievement::getAchievementCode, a -> a, (a, b) -> a));

        List<AchievementResponse> allAchievements = Arrays.stream(AchievementCode.values())
                .map(code -> toResponse(code, map.get(code)))
                .toList();

        // Recent unlocks (up to 3 most recently unlocked)
        List<AchievementResponse> recentUnlocks = allAchievements.stream()
                .filter(AchievementResponse::unlocked)
                .filter(a -> a.unlockedAt() != null)
                .sorted(Comparator.comparing(AchievementResponse::unlockedAt).reversed())
                .limit(3)
                .toList();

        return new GamificationOverviewResponse(
                streakDetails,
                allAchievements,
                totalCoins,
                newlyUnlocked.isEmpty() ? recentUnlocks : newlyUnlocked
        );
    }

    @Override
    public List<AchievementResponse> evaluateAchievements(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<AchievementCode, UserAchievement> existingMap = userAchievementRepository.findByUser_Id(userId).stream()
                .collect(Collectors.toMap(UserAchievement::getAchievementCode, a -> a, (a, b) -> a));

        List<UserAchievement> toSave = new ArrayList<>();
        List<AchievementResponse> newlyUnlocked = new ArrayList<>();

        LocalDate today = LocalDate.now();
        LocalDate lookback = today.minusDays(400);
        long activeDays = financialActivityRepository.countDistinctActiveDaysInRange(userId, lookback, today);
        long txCount = transactionRepository.countByUserId(userId);
        long goalContribCount = goalContributionRepository.countByUser_Id(userId);
        long completedGoals = financialGoalRepository.countByUser_IdAndStatusIn(
                userId,
                List.of(GoalStatus.COMPLETED, GoalStatus.OVERACHIEVED)
        );
        long budgetsCount = budgetRepository.countByUserId(userId);
        List<FinancialGoal> allGoals = financialGoalRepository.findAllByUser_Id(userId);
        if (allGoals == null) allGoals = Collections.emptyList();

        boolean hasEmergencyFunded = allGoals.stream().anyMatch(g ->
                g.getTitle() != null && g.getTitle().toLowerCase().contains("emergency")
                        && g.getSavedAmount() != null && g.getSavedAmount().compareTo(BigDecimal.ZERO) > 0);

        boolean hasStayedInBudget = checkBudgetMastery(userId);

        for (AchievementCode code : AchievementCode.values()) {
            UserAchievement ua = existingMap.get(code);
            if (ua == null) {
                ua = new UserAchievement(user, code);
            }

            boolean wasUnlocked = ua.isUnlocked();
            int progress = ua.getCurrentProgress();
            boolean qualifies = false;

            switch (code) {
                case FIRST_STEP -> {
                    progress = (int) Math.min(txCount, 1);
                    qualifies = txCount >= 1;
                }
                case SMART_SAVER -> {
                    progress = (int) Math.min(goalContribCount, 1);
                    qualifies = goalContribCount >= 1;
                }
                case CONSISTENCY_BUILDER -> {
                    progress = (int) Math.min(activeDays, 7);
                    qualifies = activeDays >= 7;
                }
                case MONEY_DISCIPLINE -> {
                    progress = (int) Math.min(activeDays, 30);
                    qualifies = activeDays >= 30;
                }
                case GOAL_CRUSHER -> {
                    progress = (int) Math.min(completedGoals, 1);
                    qualifies = completedGoals >= 1;
                }
                case EMERGENCY_READY -> {
                    progress = hasEmergencyFunded ? 1 : 0;
                    qualifies = hasEmergencyFunded;
                }
                case MONEY_MANAGER -> {
                    progress = (int) Math.min(budgetsCount, 1);
                    qualifies = budgetsCount >= 1;
                }
                case BUDGET_MASTER -> {
                    progress = hasStayedInBudget ? 1 : 0;
                    qualifies = hasStayedInBudget;
                }
            }

            ua.setCurrentProgress(progress);
            if (!wasUnlocked && qualifies) {
                ua.setUnlocked(true);
                ua.setUnlockedAt(Instant.now());
                toSave.add(ua);

                // Award coins idempotently
                coinService.awardCoins(
                        userId,
                        code.getCoinReward(),
                        "Unlocked achievement: " + code.getTitle(),
                        "ACHIEVEMENT",
                        code.name()
                );

                newlyUnlocked.add(toResponse(code, ua));
                log.info("User {} unlocked achievement: {}", userId, code.name());
            } else if (!wasUnlocked) {
                toSave.add(ua);
            }
        }

        if (!toSave.isEmpty()) {
            userAchievementRepository.saveAll(toSave);
        }

        return newlyUnlocked;
    }

    private boolean checkBudgetMastery(UUID userId) {
        List<Budget> budgets = budgetRepository.findAllByUserIdOrderByMonthDescCreatedAtDesc(userId);
        if (budgets == null || budgets.isEmpty()) return false;

        // Check if there is any budget where total expenses did not exceed the budget
        for (Budget b : budgets) {
            try {
                YearMonth ym = YearMonth.parse(b.getMonth());
                LocalDate start = ym.atDay(1);
                LocalDate end = ym.atEndOfMonth();
                BigDecimal spent = b.getCategory() != null
                        ? transactionRepository.sumExpensesByCategoryIdAndDateRange(userId, b.getCategory().getId(), start, end)
                        : transactionRepository.sumAmountByUserIdAndTypeAndDateRange(userId, TransactionType.EXPENSE, start, end);
                if (spent != null && spent.compareTo(b.getAmount()) <= 0) {
                    return true;
                }
            } catch (Exception ignored) {
            }
        }
        return false;
    }

    private AchievementResponse toResponse(AchievementCode code, UserAchievement ua) {
        boolean unlocked = ua != null && ua.isUnlocked();
        Instant unlockedAt = ua != null ? ua.getUnlockedAt() : null;
        int current = ua != null ? ua.getCurrentProgress() : 0;
        int target = code.getTargetProgress();
        double pct = target > 0 ? Math.min(100.0, Math.round(((double) current / target) * 1000.0) / 10.0) : 0.0;
        if (unlocked) pct = 100.0;

        return new AchievementResponse(
                code.name(),
                code.getTitle(),
                code.getDescription(),
                code.getCategory(),
                code.getIcon(),
                unlocked,
                unlockedAt,
                current,
                target,
                pct,
                code.getCoinReward()
        );
    }
}
