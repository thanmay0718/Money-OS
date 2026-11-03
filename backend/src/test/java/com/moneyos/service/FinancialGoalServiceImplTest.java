package com.moneyos.service;

import com.moneyos.dto.request.FinancialGoalRequest;
import com.moneyos.dto.response.FinancialGoalResponse;
import com.moneyos.entity.FinancialGoal;
import com.moneyos.entity.User;
import com.moneyos.enums.GoalStatus;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.FinancialGoalRepository;
import com.moneyos.service.impl.FinancialGoalServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancialGoalServiceImplTest {

    @Mock
    private FinancialGoalRepository goalRepository;

    @InjectMocks
    private FinancialGoalServiceImpl goalService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User("Bob", "bob@moneyos.dev", "hash");
        ReflectionTestUtils.setField(user, "id", userId);
        user.setCurrency("INR");
    }

    @Test
    void createGoal_shouldComputeDeterministicStatus_Active() {
        FinancialGoalRequest request = new FinancialGoalRequest(
                "Emergency Fund",
                new BigDecimal("100000.00"),
                new BigDecimal("20000.00"),
                "INR",
                LocalDate.now().plusMonths(6)
        );

        when(goalRepository.save(any(FinancialGoal.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        FinancialGoalResponse response = goalService.createGoal(user, request);

        assertThat(response.status()).isEqualTo(GoalStatus.ACTIVE);
        assertThat(response.progressPercentage()).isEqualByComparingTo(new BigDecimal("20.00"));
    }

    @Test
    void createGoal_shouldComputeDeterministicStatus_Completed() {
        FinancialGoalRequest request = new FinancialGoalRequest(
                "Phone Savings",
                new BigDecimal("50000.00"),
                new BigDecimal("50000.00"),
                "INR",
                LocalDate.now().plusMonths(1)
        );

        when(goalRepository.save(any(FinancialGoal.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        FinancialGoalResponse response = goalService.createGoal(user, request);

        assertThat(response.status()).isEqualTo(GoalStatus.COMPLETED);
        assertThat(response.progressPercentage()).isEqualByComparingTo(new BigDecimal("100.00"));
    }

    @Test
    void createGoal_shouldComputeDeterministicStatus_Overachieved() {
        FinancialGoalRequest request = new FinancialGoalRequest(
                "Phone Savings",
                new BigDecimal("50000.00"),
                new BigDecimal("55000.00"),
                "INR",
                LocalDate.now().plusMonths(1)
        );

        when(goalRepository.save(any(FinancialGoal.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        FinancialGoalResponse response = goalService.createGoal(user, request);

        assertThat(response.status()).isEqualTo(GoalStatus.OVERACHIEVED);
        assertThat(response.progressPercentage()).isEqualByComparingTo(new BigDecimal("110.00"));
    }

    @Test
    void createGoal_shouldComputeDeterministicStatus_Overdue() {
        FinancialGoalRequest request = new FinancialGoalRequest(
                "Past Trip",
                new BigDecimal("50000.00"),
                new BigDecimal("20000.00"),
                "INR",
                LocalDate.now().minusDays(5)
        );

        when(goalRepository.save(any(FinancialGoal.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        FinancialGoalResponse response = goalService.createGoal(user, request);

        assertThat(response.status()).isEqualTo(GoalStatus.OVERDUE);
    }

    @Test
    void createGoal_shouldRejectInvalidAmounts() {
        FinancialGoalRequest invalidTarget = new FinancialGoalRequest(
                "Invalid",
                new BigDecimal("0.00"),
                BigDecimal.ZERO,
                "INR",
                null
        );

        assertThatThrownBy(() -> goalService.createGoal(user, invalidTarget))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Target amount must be greater than zero");

        FinancialGoalRequest negativeSaved = new FinancialGoalRequest(
                "Invalid",
                new BigDecimal("1000.00"),
                new BigDecimal("-50.00"),
                "INR",
                null
        );

        assertThatThrownBy(() -> goalService.createGoal(user, negativeSaved))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Saved amount cannot be negative");
    }

    @Test
    void updateGoal_shouldEnforceUserScoping() {
        UUID goalId = UUID.randomUUID();
        when(goalRepository.findByIdAndUser_Id(goalId, userId)).thenReturn(Optional.empty());

        FinancialGoalRequest request = new FinancialGoalRequest(
                "Updated",
                new BigDecimal("20000.00"),
                null,
                null,
                null
        );

        assertThatThrownBy(() -> goalService.updateGoal(userId, goalId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Goal not found");
    }
}
