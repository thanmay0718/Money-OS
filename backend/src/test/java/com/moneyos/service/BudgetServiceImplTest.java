package com.moneyos.service;

import com.moneyos.dto.response.BudgetSuggestionDto;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.entity.UserFinancialProfile;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserFinancialProfileRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.impl.BudgetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserFinancialProfileRepository profileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BudgetServiceImpl budgetService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User("Alice", "alice@moneyos.dev", "hash");
        ReflectionTestUtils.setField(user, "id", userId);
        user.setCurrency("INR");
    }

    @Test
    void getBudgetSuggestion_shouldComputeAvailableToSpendCorrectly() {
        UserFinancialProfile profile = new UserFinancialProfile(user);
        profile.setEstimatedMonthlyIncome(new BigDecimal("10000.00"));

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.INCOME))
                .thenReturn(new BigDecimal("12000.00"));
        when(transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.EXPENSE))
                .thenReturn(new BigDecimal("3500.00"));
        when(transactionRepository.sumVolumeByUserIdTypeAndDateRange(eq(userId), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(new BigDecimal("2500.00"));

        BudgetSuggestionDto result = budgetService.getBudgetSuggestion(user);

        assertThat(result.estimatedMonthlyIncome()).isEqualByComparingTo(new BigDecimal("10000.00"));
        assertThat(result.recordedIncome()).isEqualByComparingTo(new BigDecimal("12000.00"));
        assertThat(result.recordedExpense()).isEqualByComparingTo(new BigDecimal("3500.00"));
        // availableToSpend = estimatedMonthlyIncome - current-month expense = 10000 - 2500 = 7500
        assertThat(result.availableToSpend()).isEqualByComparingTo(new BigDecimal("7500.00"));
        assertThat(result.calculationPeriod()).matches("\\d{4}-\\d{2}-01 to \\d{4}-\\d{2}-\\d{2}");
        assertThat(result.currency()).isEqualTo("INR");
    }

    @Test
    void getBudgetSuggestion_shouldNotUseRecordedIncomeAsAnEstimateWhenProfileIncomeIsZero() {
        UserFinancialProfile profile = new UserFinancialProfile(user);
        profile.setEstimatedMonthlyIncome(BigDecimal.ZERO);

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.INCOME))
                .thenReturn(new BigDecimal("100000.00"));
        when(transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.EXPENSE))
                .thenReturn(new BigDecimal("14960.00"));

        BudgetSuggestionDto result = budgetService.getBudgetSuggestion(user);

        assertThat(result.availableToSpend()).isNull();
        assertThat(result.recordedIncome()).isEqualByComparingTo("100000.00");
        assertThat(result.recordedExpense()).isEqualByComparingTo("14960.00");
        verify(transactionRepository, never())
                .sumVolumeByUserIdAndType(userId, TransactionType.TRANSFER);
    }

    @Test
    void getBudgetSuggestion_shouldHandleNullsSafely() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.INCOME)).thenReturn(null);
        when(transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.EXPENSE)).thenReturn(null);

        BudgetSuggestionDto result = budgetService.getBudgetSuggestion(user);

        assertThat(result.estimatedMonthlyIncome()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.recordedIncome()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.recordedExpense()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.availableToSpend()).isNull();
        assertThat(result.currency()).isEqualTo("INR");
    }

    @Test
    void getBudgetSuggestion_shouldExposeAvailableToSpendAsPlanningProjectionNotCash() {
        UserFinancialProfile profile = new UserFinancialProfile(user);
        profile.setEstimatedMonthlyIncome(new BigDecimal("2000.00"));

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.INCOME))
                .thenReturn(new BigDecimal("5000.00"));
        when(transactionRepository.sumVolumeByUserIdAndType(userId, TransactionType.EXPENSE))
                .thenReturn(new BigDecimal("3000.00"));
        when(transactionRepository.sumVolumeByUserIdTypeAndDateRange(eq(userId), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(new BigDecimal("3000.00"));

        BudgetSuggestionDto result = budgetService.getBudgetSuggestion(user);

        // Expenses exceeding the estimate are valid: report the negative planning remainder, never a cash balance.
        assertThat(result.availableToSpend()).isEqualByComparingTo(new BigDecimal("-1000.00"));
        // recordedIncome is distinctly 5000, preserved separately from estimated income
        assertThat(result.recordedIncome()).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(result.estimatedMonthlyIncome()).isEqualByComparingTo(new BigDecimal("2000.00"));
    }
}
