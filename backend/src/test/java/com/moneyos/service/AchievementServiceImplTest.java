package com.moneyos.service;

import com.moneyos.dto.response.AchievementResponse;
import com.moneyos.dto.response.GamificationOverviewResponse;
import com.moneyos.dto.response.StreakDetailsResponse;
import com.moneyos.entity.User;
import com.moneyos.enums.AchievementCode;
import com.moneyos.enums.GoalStatus;
import com.moneyos.repository.*;
import com.moneyos.service.impl.AchievementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

class AchievementServiceImplTest {

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User("John Doe", "john@example.com", "hash123");
        ReflectionTestUtils.setField(user, "id", userId);
    }

    @SuppressWarnings("unchecked")
    private <T> T createProxy(Class<T> iface, Map<String, Object> methodReturns) {
        return (T) Proxy.newProxyInstance(
                iface.getClassLoader(),
                new Class<?>[]{iface},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if (methodReturns.containsKey(name)) {
                        return methodReturns.get(name);
                    }
                    if (method.getReturnType().equals(boolean.class)) return false;
                    if (method.getReturnType().equals(int.class)) return 0;
                    if (method.getReturnType().equals(long.class)) return 0L;
                    if (method.getReturnType().equals(List.class)) return Collections.emptyList();
                    if (method.getReturnType().equals(Optional.class)) return Optional.empty();
                    return null;
                }
        );
    }

    @Test
    @DisplayName("evaluateAchievements unlocks FIRST_STEP when user has transactions")
    void evaluateAchievements_firstStep() {
        UserRepository userRepo = createProxy(UserRepository.class, Map.of(
                "findById", Optional.of(user)
        ));
        UserAchievementRepository achievementRepo = createProxy(UserAchievementRepository.class, Map.of(
                "findByUser_Id", Collections.emptyList()
        ));
        TransactionRepository txRepo = createProxy(TransactionRepository.class, Map.of(
                "countByUserId", 3L
        ));
        GoalContributionRepository gcRepo = createProxy(GoalContributionRepository.class, Map.of(
                "countByUser_Id", 0L
        ));
        FinancialGoalRepository goalRepo = createProxy(FinancialGoalRepository.class, Map.of(
                "countByUser_IdAndStatus", 0L,
                "findAllByUser_Id", Collections.emptyList()
        ));
        BudgetRepository budgetRepo = createProxy(BudgetRepository.class, Map.of(
                "countByUserId", 0L,
                "findAllByUserIdOrderByMonthDescCreatedAtDesc", Collections.emptyList()
        ));
        FinancialActivityRepository actRepo = createProxy(FinancialActivityRepository.class, Map.of(
                "countDistinctActiveDaysInRange", 2L
        ));

        StreakService streakService = (uid, ref) -> new StreakDetailsResponse(
                1, 1, 1, 1, 14.3, true, LocalDate.now(), List.of(true, false, false, false, false, false, false)
        );

        final List<String> awarded = new ArrayList<>();
        CoinService coinService = new CoinService() {
            @Override
            public int getBalance(UUID uId) { return 100; }
            @Override
            public boolean awardCoins(UUID uId, int amount, String reason, String refType, String refId) {
                awarded.add(refId);
                return true;
            }
            @Override
            public void backfillTransactionCoins(UUID uId) {
            }
            @Override
            public boolean redeemReward(UUID uId, String rewardCode) {
                return false;
            }
            @Override
            public List<com.moneyos.dto.response.RewardItemResponse> getAvailableRewards(UUID uId) {
                return List.of();
            }
        };

        AchievementServiceImpl service = new AchievementServiceImpl(
                achievementRepo, txRepo, gcRepo, goalRepo, budgetRepo, actRepo, userRepo, streakService, coinService
        );

        List<AchievementResponse> newlyUnlocked = service.evaluateAchievements(userId);

        assertThat(newlyUnlocked).isNotEmpty();
        assertThat(newlyUnlocked).anyMatch(a -> a.code().equals(AchievementCode.FIRST_STEP.name()) && a.unlocked());
        assertThat(awarded).contains(AchievementCode.FIRST_STEP.name());
    }

    @Test
    @DisplayName("getGamificationOverview returns all 8 badges, streak metrics, and total coins")
    void getGamificationOverview() {
        UserRepository userRepo = createProxy(UserRepository.class, Map.of(
                "findById", Optional.of(user)
        ));
        UserAchievementRepository achievementRepo = createProxy(UserAchievementRepository.class, Map.of(
                "findByUser_Id", Collections.emptyList()
        ));
        TransactionRepository txRepo = createProxy(TransactionRepository.class, Map.of("countByUserId", 0L));
        GoalContributionRepository gcRepo = createProxy(GoalContributionRepository.class, Map.of("countByUser_Id", 0L));
        FinancialGoalRepository goalRepo = createProxy(FinancialGoalRepository.class, Map.of(
                "countByUser_IdAndStatus", 0L,
                "findAllByUser_Id", Collections.emptyList()
        ));
        BudgetRepository budgetRepo = createProxy(BudgetRepository.class, Map.of(
                "countByUserId", 0L,
                "findAllByUserIdOrderByMonthDescCreatedAtDesc", Collections.emptyList()
        ));
        FinancialActivityRepository actRepo = createProxy(FinancialActivityRepository.class, Map.of("countDistinctActiveDaysInRange", 0L));

        StreakService streakService = (uid, ref) -> new StreakDetailsResponse(
                5, 10, 4, 12, 57.1, true, LocalDate.now(), List.of(true, true, true, true, false, false, false)
        );

        CoinService coinService = new CoinService() {
            @Override
            public int getBalance(UUID uId) { return 450; }
            @Override
            public boolean awardCoins(UUID uId, int amount, String reason, String refType, String refId) { return true; }
            @Override
            public void backfillTransactionCoins(UUID uId) {
            }
            @Override
            public boolean redeemReward(UUID uId, String rewardCode) {
                return false;
            }
            @Override
            public List<com.moneyos.dto.response.RewardItemResponse> getAvailableRewards(UUID uId) {
                return List.of();
            }
        };

        AchievementServiceImpl service = new AchievementServiceImpl(
                achievementRepo, txRepo, gcRepo, goalRepo, budgetRepo, actRepo, userRepo, streakService, coinService
        );

        GamificationOverviewResponse overview = service.getGamificationOverview(userId);

        assertThat(overview.streak().currentStreak()).isEqualTo(5);
        assertThat(overview.totalCoins()).isEqualTo(450);
        assertThat(overview.achievements()).hasSize(8);
    }
}
