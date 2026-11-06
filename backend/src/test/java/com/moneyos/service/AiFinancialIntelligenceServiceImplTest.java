package com.moneyos.service;

import com.moneyos.dto.response.AiInsightResponse;
import com.moneyos.dto.response.BudgetRecommendationResponse;
import com.moneyos.dto.response.CashflowForecastResponse;
import com.moneyos.entity.Category;
import com.moneyos.entity.MoneyPocket;
import com.moneyos.entity.Transaction;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.repository.*;
import com.moneyos.service.impl.AiFinancialIntelligenceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiFinancialIntelligenceServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private MoneyPocketRepository pocketRepository;

    @Mock
    private MoneyPocketService moneyPocketService;

    @Mock
    private RecurringTransactionRepository recurringRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private FinancialGoalRepository goalRepository;

    @InjectMocks
    private AiFinancialIntelligenceServiceImpl aiService;

    private UUID userId;
    private User testUser;
    private Category testCategory;
    private MoneyPocket testPocket;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User("John Doe", "john@example.com", "pass");
        testCategory = new Category(testUser, "Food & Dining", TransactionType.EXPENSE);
        testCategory.setId(UUID.randomUUID());
        testPocket = new MoneyPocket(testUser, "Checking");
        testPocket.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("getCashflowForecast calculates burn rate and projection")
    void testGetCashflowForecast() {
        when(pocketRepository.findAllByUser_IdAndActiveTrue(userId)).thenReturn(List.of(testPocket));
        when(moneyPocketService.getPocketAvailableBalance(testPocket.getId(), userId))
                .thenReturn(new BigDecimal("5000.00"));
        when(transactionRepository.sumAmountByUserIdAndTypeAndDateRange(eq(userId), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(new BigDecimal("1500.00"));
        when(recurringRepository.findAllByUserIdAndActiveTrueOrderByNextDueDateAsc(userId))
                .thenReturn(Collections.emptyList());

        CashflowForecastResponse forecast = aiService.getCashflowForecast(userId);

        assertThat(forecast).isNotNull();
        assertThat(forecast.currentTotalBalance()).isEqualByComparingTo("5000.00");
        assertThat(forecast.burnRateDaily()).isEqualByComparingTo("50.00");
        assertThat(forecast.points()).hasSize(31);
        assertThat(forecast.forecastStatus()).isIn("SURPLUS", "STABLE");
    }

    @Test
    @DisplayName("generateInsights identifies spending spike anomaly")
    void testGenerateInsightsWithAnomaly() {
        when(pocketRepository.findAllByUser_IdAndActiveTrue(userId)).thenReturn(List.of(testPocket));
        when(moneyPocketService.getPocketAvailableBalance(testPocket.getId(), userId))
                .thenReturn(new BigDecimal("5000.00"));
        when(recurringRepository.findAllByUserIdAndActiveTrueOrderByNextDueDateAsc(userId))
                .thenReturn(Collections.emptyList());
        when(goalRepository.findAllByUser_Id(userId)).thenReturn(Collections.emptyList());

        Transaction normalTx = new Transaction(testUser, TransactionType.EXPENSE, new BigDecimal("20.00"), "Lunch", testCategory, null, null, LocalDate.now().minusDays(5));
        Transaction anotherNormalTx = new Transaction(testUser, TransactionType.EXPENSE, new BigDecimal("20.00"), "Snack", testCategory, null, null, LocalDate.now().minusDays(4));

        Transaction spikeTx = new Transaction(testUser, TransactionType.EXPENSE, new BigDecimal("800.00"), "Fine Dining Banquet", testCategory, null, null, LocalDate.now().minusDays(2));

        when(transactionRepository.findByUserId(userId)).thenReturn(List.of(normalTx, anotherNormalTx, spikeTx));

        List<AiInsightResponse> insights = aiService.generateInsights(userId);

        assertThat(insights).isNotEmpty();
        assertThat(insights).anyMatch(i -> i.type() == AiInsightResponse.InsightType.SPENDING_ANOMALY);
    }

    @Test
    @DisplayName("getBudgetRecommendations produces optimized targets")
    void testGetBudgetRecommendations() {
        when(categoryRepository.findAllByUser_IdAndActiveTrue(userId)).thenReturn(List.of(testCategory));

        Transaction tx = new Transaction(testUser, TransactionType.EXPENSE, new BigDecimal("400.00"), "Groceries", testCategory, null, null, LocalDate.now().minusDays(3));
        tx.setCategory(testCategory);

        when(transactionRepository.findByUserId(userId)).thenReturn(List.of(tx));

        List<BudgetRecommendationResponse> recommendations = aiService.getBudgetRecommendations(userId);

        assertThat(recommendations).hasSize(1);
        assertThat(recommendations.get(0).categoryName()).isEqualTo("Food & Dining");
        assertThat(recommendations.get(0).recommendedBudget()).isLessThan(new BigDecimal("400.00"));
        assertThat(recommendations.get(0).potentialMonthlySavings()).isGreaterThan(BigDecimal.ZERO);
    }
}
