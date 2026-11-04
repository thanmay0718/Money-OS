package com.moneyos.service;

import com.moneyos.dto.response.FinancialActivityResponse;
import com.moneyos.dto.response.HeatmapDayDto;
import com.moneyos.dto.response.OverviewSummaryResponse;
import com.moneyos.entity.*;
import com.moneyos.enums.ActivityReferenceType;
import com.moneyos.enums.ActivityType;
import com.moneyos.enums.GoalStatus;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.*;
import com.moneyos.service.impl.FinancialActivityServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancialActivityServiceImplTest {

    @Mock
    private FinancialActivityRepository financialActivityRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private GoalContributionRepository goalContributionRepository;

    @Mock
    private MoneyPocketRepository moneyPocketRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private FinancialGoalRepository financialGoalRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FinancialActivityServiceImpl financialActivityService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User("John Doe", "john@example.com", "hash123");
        ReflectionTestUtils.setField(user, "id", userId);
        user.setCurrency("INR");
    }

    @Test
    @DisplayName("recordTransactionActivity should create and save an INCOME financial activity")
    void recordTransactionActivity_income() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        MoneyPocket toPocket = new MoneyPocket(user, "Salary Pocket");
        ReflectionTestUtils.setField(toPocket, "id", UUID.randomUUID());

        Transaction tx = new Transaction(
                user,
                TransactionType.INCOME,
                BigDecimal.valueOf(50000),
                "Monthly Salary",
                null,
                null,
                toPocket,
                LocalDate.now()
        );
        ReflectionTestUtils.setField(tx, "id", UUID.randomUUID());

        financialActivityService.recordTransactionActivity(userId, tx);

        ArgumentCaptor<FinancialActivity> captor = ArgumentCaptor.forClass(FinancialActivity.class);
        verify(financialActivityRepository).save(captor.capture());

        FinancialActivity saved = captor.getValue();
        assertThat(saved.getActivityType()).isEqualTo(ActivityType.TRANSACTION_INCOME);
        assertThat(saved.getTitle()).isEqualTo("Income Added");
        assertThat(saved.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(50000));
        assertThat(saved.getReferenceType()).isEqualTo(ActivityReferenceType.TRANSACTION);
        assertThat(saved.getReferenceId()).isEqualTo(tx.getId());
    }

    @Test
    @DisplayName("recordTransactionActivity should create and save an EXPENSE financial activity")
    void recordTransactionActivity_expense() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        MoneyPocket fromPocket = new MoneyPocket(user, "Spending Pocket");
        ReflectionTestUtils.setField(fromPocket, "id", UUID.randomUUID());

        Transaction tx = new Transaction(
                user,
                TransactionType.EXPENSE,
                BigDecimal.valueOf(1500),
                "Grocery shopping",
                null,
                fromPocket,
                null,
                LocalDate.now()
        );
        ReflectionTestUtils.setField(tx, "id", UUID.randomUUID());

        financialActivityService.recordTransactionActivity(userId, tx);

        ArgumentCaptor<FinancialActivity> captor = ArgumentCaptor.forClass(FinancialActivity.class);
        verify(financialActivityRepository).save(captor.capture());

        FinancialActivity saved = captor.getValue();
        assertThat(saved.getActivityType()).isEqualTo(ActivityType.TRANSACTION_EXPENSE);
        assertThat(saved.getTitle()).isEqualTo("Expense Recorded");
        assertThat(saved.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(1500));
    }

    @Test
    @DisplayName("recordTransactionActivity should create and save a TRANSFER financial activity")
    void recordTransactionActivity_transfer() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        MoneyPocket fromPocket = new MoneyPocket(user, "Main Wallet");
        MoneyPocket toPocket = new MoneyPocket(user, "Savings Vault");
        ReflectionTestUtils.setField(fromPocket, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(toPocket, "id", UUID.randomUUID());

        Transaction tx = new Transaction(
                user,
                TransactionType.TRANSFER,
                BigDecimal.valueOf(10000),
                "Reserve transfer",
                null,
                fromPocket,
                toPocket,
                LocalDate.now()
        );
        ReflectionTestUtils.setField(tx, "id", UUID.randomUUID());

        financialActivityService.recordTransactionActivity(userId, tx);

        ArgumentCaptor<FinancialActivity> captor = ArgumentCaptor.forClass(FinancialActivity.class);
        verify(financialActivityRepository).save(captor.capture());

        FinancialActivity saved = captor.getValue();
        assertThat(saved.getActivityType()).isEqualTo(ActivityType.TRANSACTION_TRANSFER);
        assertThat(saved.getTitle()).isEqualTo("Transfer Completed");
    }

    @Test
    @DisplayName("recordGoalContributionActivity should create and save GOAL_CONTRIBUTION activity")
    void recordGoalContributionActivity() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        FinancialGoal goal = new FinancialGoal(user, "Emergency Fund", BigDecimal.valueOf(50000), BigDecimal.ZERO, "INR", LocalDate.now().plusMonths(6));
        ReflectionTestUtils.setField(goal, "id", UUID.randomUUID());

        MoneyPocket pocket = new MoneyPocket(user, "Main Pocket");
        ReflectionTestUtils.setField(pocket, "id", UUID.randomUUID());

        GoalContribution contribution = new GoalContribution(
                user,
                goal,
                pocket,
                BigDecimal.valueOf(5000),
                LocalDate.now(),
                "Monthly allocation",
                null
        );
        ReflectionTestUtils.setField(contribution, "id", UUID.randomUUID());

        financialActivityService.recordGoalContributionActivity(userId, contribution);

        ArgumentCaptor<FinancialActivity> captor = ArgumentCaptor.forClass(FinancialActivity.class);
        verify(financialActivityRepository).save(captor.capture());

        FinancialActivity saved = captor.getValue();
        assertThat(saved.getActivityType()).isEqualTo(ActivityType.GOAL_CONTRIBUTION);
        assertThat(saved.getTitle()).isEqualTo("Goal Contribution");
        assertThat(saved.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(5000));
        assertThat(saved.getReferenceType()).isEqualTo(ActivityReferenceType.GOAL_CONTRIBUTION);
    }

    @Test
    @DisplayName("recordPocketCreatedActivity should record pocket creation")
    void recordPocketCreatedActivity() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        MoneyPocket pocket = new MoneyPocket(user, "Vacation Fund");
        ReflectionTestUtils.setField(pocket, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(pocket, "createdAt", Instant.now());

        financialActivityService.recordPocketCreatedActivity(userId, pocket);

        ArgumentCaptor<FinancialActivity> captor = ArgumentCaptor.forClass(FinancialActivity.class);
        verify(financialActivityRepository).save(captor.capture());

        FinancialActivity saved = captor.getValue();
        assertThat(saved.getActivityType()).isEqualTo(ActivityType.POCKET_CREATED);
        assertThat(saved.getTitle()).isEqualTo("Pocket Created");
    }

    @Test
    @DisplayName("getSummary should correctly aggregate activities, active days, streak, and net savings")
    void getSummary_success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);

        when(financialActivityRepository.countActivitiesInRange(userId, start, end)).thenReturn(42L);
        when(financialActivityRepository.countDistinctActiveDaysInRange(userId, start, end)).thenReturn(18L);

        // Previous period
        LocalDate prevStart = start.minusDays(30);
        LocalDate prevEnd = start.minusDays(1);
        when(financialActivityRepository.countActivitiesInRange(userId, prevStart, prevEnd)).thenReturn(30L);
        when(financialActivityRepository.countDistinctActiveDaysInRange(userId, prevStart, prevEnd)).thenReturn(14L);

        // Active dates for streak: today and yesterday
        when(financialActivityRepository.findDistinctActiveDates(eq(userId), any(LocalDate.class)))
                .thenReturn(List.of(end.minusDays(2), end.minusDays(1), end));

        // Income & Expense totals (transfers strictly excluded)
        when(transactionRepository.sumAmountByUserIdAndTypeAndDateRange(userId, TransactionType.INCOME, start, end))
                .thenReturn(BigDecimal.valueOf(80000));
        when(transactionRepository.sumAmountByUserIdAndTypeAndDateRange(userId, TransactionType.EXPENSE, start, end))
                .thenReturn(BigDecimal.valueOf(35000));

        OverviewSummaryResponse response = financialActivityService.getSummary(userId, start, end);

        assertThat(response.totalActivities()).isEqualTo(42L);
        assertThat(response.activeDays()).isEqualTo(18L);
        assertThat(response.currentStreak()).isEqualTo(3);
        assertThat(response.longestStreak()).isEqualTo(3);
        assertThat(response.monthlyIncome()).isEqualByComparingTo(BigDecimal.valueOf(80000));
        assertThat(response.monthlyExpenses()).isEqualByComparingTo(BigDecimal.valueOf(35000));
        assertThat(response.monthlySavings()).isEqualByComparingTo(BigDecimal.valueOf(45000)); // 80000 - 35000
        assertThat(response.previousPeriodActivities()).isEqualTo(30L);
        assertThat(response.previousPeriodActiveDays()).isEqualTo(14L);
    }

    @Test
    @DisplayName("getHeatmap should map query aggregates and compute correct intensities")
    void getHeatmap_success() {
        LocalDate d1 = LocalDate.of(2026, 10, 1);
        LocalDate d2 = LocalDate.of(2026, 10, 2);

        List<Object[]> raw = new ArrayList<>();
        // Row: [0]=LocalDate, [1]=activityCount, [2]=income, [3]=expenses, [4]=goalContributions, [5]=txCount
        raw.add(new Object[]{d1, 1L, BigDecimal.valueOf(5000), BigDecimal.ZERO, BigDecimal.ZERO, 1L});
        raw.add(new Object[]{d2, 6L, BigDecimal.ZERO, BigDecimal.valueOf(1200), BigDecimal.valueOf(500), 4L});

        when(financialActivityRepository.aggregateByDate(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(raw);

        List<HeatmapDayDto> heatmap = financialActivityService.getHeatmap(userId, d1, d2);

        assertThat(heatmap).hasSize(2);
        assertThat(heatmap.get(0).date()).isEqualTo("2026-10-01");
        assertThat(heatmap.get(0).activityCount()).isEqualTo(1L);
        assertThat(heatmap.get(0).intensity()).isEqualTo(1); // 1 activity -> level 1

        assertThat(heatmap.get(1).date()).isEqualTo("2026-10-02");
        assertThat(heatmap.get(1).activityCount()).isEqualTo(6L);
        assertThat(heatmap.get(1).intensity()).isEqualTo(4); // 6+ activities -> level 4
    }

    @Test
    @DisplayName("getActivityDetail should return activity if owned by user or throw ResourceNotFoundException")
    void getActivityDetail() {
        UUID actId = UUID.randomUUID();
        FinancialActivity activity = new FinancialActivity(
                user,
                ActivityType.TRANSACTION_INCOME,
                "Income Added",
                "Salary",
                ActivityReferenceType.TRANSACTION,
                UUID.randomUUID(),
                BigDecimal.valueOf(50000),
                LocalDate.now()
        );
        ReflectionTestUtils.setField(activity, "id", actId);

        when(financialActivityRepository.findByIdAndUser_Id(actId, userId))
                .thenReturn(Optional.of(activity));

        FinancialActivityResponse res = financialActivityService.getActivityDetail(userId, actId);
        assertThat(res.id()).isEqualTo(actId);
        assertThat(res.title()).isEqualTo("Income Added");

        // When not found
        UUID missingId = UUID.randomUUID();
        when(financialActivityRepository.findByIdAndUser_Id(missingId, userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> financialActivityService.getActivityDetail(userId, missingId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
