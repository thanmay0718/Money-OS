package com.moneyos.service;

import com.moneyos.dto.request.GoalContributionRequest;
import com.moneyos.dto.response.GoalContributionResponse;
import com.moneyos.entity.FinancialGoal;
import com.moneyos.entity.GoalContribution;
import com.moneyos.entity.MoneyPocket;
import com.moneyos.entity.User;
import com.moneyos.enums.GoalStatus;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.FinancialGoalRepository;
import com.moneyos.repository.GoalContributionRepository;
import com.moneyos.repository.MoneyPocketRepository;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.impl.GoalContributionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoalContributionServiceImplTest {

    @Mock
    private GoalContributionRepository goalContributionRepository;

    @Mock
    private FinancialGoalRepository financialGoalRepository;

    @Mock
    private MoneyPocketRepository moneyPocketRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GoalContributionServiceImpl contributionService;

    private User user;
    private UUID userId;
    private MoneyPocket pocket;
    private UUID pocketId;
    private FinancialGoal goal;
    private UUID goalId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User("Alice", "alice@moneyos.dev", "hash");
        ReflectionTestUtils.setField(user, "id", userId);
        user.setCurrency("INR");

        pocketId = UUID.randomUUID();
        pocket = new MoneyPocket(user, "Salary");
        ReflectionTestUtils.setField(pocket, "id", pocketId);

        goalId = UUID.randomUUID();
        goal = new FinancialGoal(
                user,
                "Buy a BYD",
                new BigDecimal("2400000.00"),
                BigDecimal.ZERO,
                "INR",
                LocalDate.now().plusYears(2)
        );
        ReflectionTestUtils.setField(goal, "id", goalId);
    }

    @Test
    void contributeToGoal_success_updatesGoalAndCalculatesProgress() {
        GoalContributionRequest request = new GoalContributionRequest(
                pocketId,
                new BigDecimal("10000.00"),
                LocalDate.now(),
                "Monthly BYD savings",
                null
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(financialGoalRepository.findByIdAndUser_Id(goalId, userId)).thenReturn(Optional.of(goal));
        when(moneyPocketRepository.findByIdAndUser_IdAndActiveTrue(pocketId, userId)).thenReturn(Optional.of(pocket));

        // Available balance: 50,000 inflow - 0 outflow - 0 prior contributions = 50,000
        when(transactionRepository.sumInflowsByPocketIdAndUserId(pocketId, userId)).thenReturn(new BigDecimal("50000.00"));
        when(transactionRepository.sumOutflowsByPocketIdAndUserId(pocketId, userId)).thenReturn(BigDecimal.ZERO);
        when(goalContributionRepository.sumContributionsByPocketIdAndUserId(pocketId, userId)).thenReturn(BigDecimal.ZERO);

        when(goalContributionRepository.save(any(GoalContribution.class))).thenAnswer(invocation -> {
            GoalContribution c = invocation.getArgument(0);
            ReflectionTestUtils.setField(c, "id", UUID.randomUUID());
            return c;
        });
        when(financialGoalRepository.save(any(FinancialGoal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GoalContributionResponse response = contributionService.contributeToGoal(userId, goalId, request);

        assertThat(response).isNotNull();
        assertThat(response.amount()).isEqualByComparingTo("10000.00");
        assertThat(response.goalTitle()).isEqualTo("Buy a BYD");
        assertThat(response.pocketName()).isEqualTo("Salary");

        // Verify updated goal
        assertThat(response.updatedGoal()).isNotNull();
        assertThat(response.updatedGoal().savedAmount()).isEqualByComparingTo("10000.00");
        assertThat(response.updatedGoal().remainingAmount()).isEqualByComparingTo("2390000.00");
        // (10000 / 2400000) * 100 = 0.42%
        assertThat(response.updatedGoal().progressPercentage()).isEqualByComparingTo("0.42");
        assertThat(response.updatedGoal().status()).isEqualTo(GoalStatus.ACTIVE);

        verify(goalContributionRepository).save(any(GoalContribution.class));
        verify(financialGoalRepository).save(goal);
    }

    @Test
    void contributeToGoal_completesGoal_whenTargetReached() {
        goal.setTargetAmount(new BigDecimal("50000.00"));
        goal.setSavedAmount(new BigDecimal("40000.00"));

        GoalContributionRequest request = new GoalContributionRequest(
                pocketId,
                new BigDecimal("10000.00"),
                LocalDate.now(),
                "Final installment",
                null
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(financialGoalRepository.findByIdAndUser_Id(goalId, userId)).thenReturn(Optional.of(goal));
        when(moneyPocketRepository.findByIdAndUser_IdAndActiveTrue(pocketId, userId)).thenReturn(Optional.of(pocket));
        when(transactionRepository.sumInflowsByPocketIdAndUserId(pocketId, userId)).thenReturn(new BigDecimal("20000.00"));
        when(transactionRepository.sumOutflowsByPocketIdAndUserId(pocketId, userId)).thenReturn(BigDecimal.ZERO);
        when(goalContributionRepository.sumContributionsByPocketIdAndUserId(pocketId, userId)).thenReturn(BigDecimal.ZERO);

        when(goalContributionRepository.save(any(GoalContribution.class))).thenAnswer(inv -> inv.getArgument(0));
        when(financialGoalRepository.save(any(FinancialGoal.class))).thenAnswer(inv -> inv.getArgument(0));

        GoalContributionResponse response = contributionService.contributeToGoal(userId, goalId, request);

        assertThat(response.updatedGoal().savedAmount()).isEqualByComparingTo("50000.00");
        assertThat(response.updatedGoal().remainingAmount()).isEqualByComparingTo("0.00");
        assertThat(response.updatedGoal().progressPercentage()).isEqualByComparingTo("100.00");
        assertThat(response.updatedGoal().status()).isEqualTo(GoalStatus.COMPLETED);
    }

    @Test
    void contributeToGoal_overachievesGoal_whenTargetExceeded() {
        goal.setTargetAmount(new BigDecimal("50000.00"));
        goal.setSavedAmount(new BigDecimal("45000.00"));

        GoalContributionRequest request = new GoalContributionRequest(
                pocketId,
                new BigDecimal("10000.00"),
                LocalDate.now(),
                "Bonus savings",
                null
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(financialGoalRepository.findByIdAndUser_Id(goalId, userId)).thenReturn(Optional.of(goal));
        when(moneyPocketRepository.findByIdAndUser_IdAndActiveTrue(pocketId, userId)).thenReturn(Optional.of(pocket));
        when(transactionRepository.sumInflowsByPocketIdAndUserId(pocketId, userId)).thenReturn(new BigDecimal("20000.00"));
        when(transactionRepository.sumOutflowsByPocketIdAndUserId(pocketId, userId)).thenReturn(BigDecimal.ZERO);
        when(goalContributionRepository.sumContributionsByPocketIdAndUserId(pocketId, userId)).thenReturn(BigDecimal.ZERO);

        when(goalContributionRepository.save(any(GoalContribution.class))).thenAnswer(inv -> inv.getArgument(0));
        when(financialGoalRepository.save(any(FinancialGoal.class))).thenAnswer(inv -> inv.getArgument(0));

        GoalContributionResponse response = contributionService.contributeToGoal(userId, goalId, request);

        assertThat(response.updatedGoal().savedAmount()).isEqualByComparingTo("55000.00");
        assertThat(response.updatedGoal().remainingAmount()).isEqualByComparingTo("0.00");
        assertThat(response.updatedGoal().progressPercentage()).isEqualByComparingTo("110.00");
        assertThat(response.updatedGoal().status()).isEqualTo(GoalStatus.OVERACHIEVED);
    }

    @Test
    void contributeToGoal_throws_whenInsufficientFundsInPocket() {
        GoalContributionRequest request = new GoalContributionRequest(
                pocketId,
                new BigDecimal("10000.00"),
                LocalDate.now(),
                "Too much",
                null
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(financialGoalRepository.findByIdAndUser_Id(goalId, userId)).thenReturn(Optional.of(goal));
        when(moneyPocketRepository.findByIdAndUser_IdAndActiveTrue(pocketId, userId)).thenReturn(Optional.of(pocket));

        // Available balance: 5,000 inflow - 2,000 outflow - 0 contributions = 3,000 available (< 10,000)
        when(transactionRepository.sumInflowsByPocketIdAndUserId(pocketId, userId)).thenReturn(new BigDecimal("5000.00"));
        when(transactionRepository.sumOutflowsByPocketIdAndUserId(pocketId, userId)).thenReturn(new BigDecimal("2000.00"));
        when(goalContributionRepository.sumContributionsByPocketIdAndUserId(pocketId, userId)).thenReturn(BigDecimal.ZERO);

        assertThatThrownBy(() -> contributionService.contributeToGoal(userId, goalId, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Insufficient funds in pocket");

        verify(goalContributionRepository, never()).save(any());
        verify(financialGoalRepository, never()).save(any());
    }

    @Test
    void contributeToGoal_throws_whenZeroOrNegativeAmount() {
        GoalContributionRequest zeroRequest = new GoalContributionRequest(pocketId, BigDecimal.ZERO, null, null, null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> contributionService.contributeToGoal(userId, goalId, zeroRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Contribution amount must be greater than zero");

        GoalContributionRequest negRequest = new GoalContributionRequest(pocketId, new BigDecimal("-50.00"), null, null, null);
        assertThatThrownBy(() -> contributionService.contributeToGoal(userId, goalId, negRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Contribution amount must be greater than zero");
    }

    @Test
    void contributeToGoal_throws_whenMoreThanTwoDecimals() {
        GoalContributionRequest badScale = new GoalContributionRequest(pocketId, new BigDecimal("10.123"), null, null, null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> contributionService.contributeToGoal(userId, goalId, badScale))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Amount cannot have more than 2 decimal places");
    }

    @Test
    void contributeToGoal_throws_whenGoalNotFound() {
        GoalContributionRequest request = new GoalContributionRequest(pocketId, new BigDecimal("100.00"), null, null, null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(financialGoalRepository.findByIdAndUser_Id(goalId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contributionService.contributeToGoal(userId, goalId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Goal not found");
    }

    @Test
    void contributeToGoal_throws_whenPocketNotFound() {
        GoalContributionRequest request = new GoalContributionRequest(pocketId, new BigDecimal("100.00"), null, null, null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(financialGoalRepository.findByIdAndUser_Id(goalId, userId)).thenReturn(Optional.of(goal));
        when(moneyPocketRepository.findByIdAndUser_IdAndActiveTrue(pocketId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contributionService.contributeToGoal(userId, goalId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Active pocket not found");
    }

    @Test
    void contributeToGoal_isIdempotent_whenDuplicateKeySupplied() {
        String key = "idemp-key-12345";
        GoalContributionRequest request = new GoalContributionRequest(
                pocketId,
                new BigDecimal("5000.00"),
                LocalDate.now(),
                "Duplicate attempt",
                key
        );

        GoalContribution existing = new GoalContribution(
                user,
                goal,
                pocket,
                new BigDecimal("5000.00"),
                LocalDate.now(),
                "Initial attempt",
                key
        );
        ReflectionTestUtils.setField(existing, "id", UUID.randomUUID());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(goalContributionRepository.findByUser_IdAndIdempotencyKey(userId, key)).thenReturn(Optional.of(existing));

        GoalContributionResponse response = contributionService.contributeToGoal(userId, goalId, request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(existing.getId());
        verify(goalContributionRepository, never()).save(any());
        verify(financialGoalRepository, never()).save(any());
    }

    @Test
    void getContributionsForGoal_returnsPagedHistory() {
        when(financialGoalRepository.findByIdAndUser_Id(goalId, userId)).thenReturn(Optional.of(goal));

        GoalContribution c1 = new GoalContribution(user, goal, pocket, new BigDecimal("5000.00"), LocalDate.now(), "First", null);
        ReflectionTestUtils.setField(c1, "id", UUID.randomUUID());

        when(goalContributionRepository.findAllByGoal_IdAndUser_Id(eq(goalId), eq(userId), any()))
                .thenReturn(new PageImpl<>(List.of(c1), PageRequest.of(0, 10), 1));

        var page = contributionService.getContributionsForGoal(userId, goalId, PageRequest.of(0, 10));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).amount()).isEqualByComparingTo("5000.00");
        assertThat(page.getContent().get(0).note()).isEqualTo("First");
    }
}
