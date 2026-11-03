package com.moneyos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyos.entity.*;
import com.moneyos.enums.GoalStatus;
import com.moneyos.enums.ProfessionalStage;
import com.moneyos.repository.*;
import com.moneyos.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class FinancialInsightsRegressionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFinancialProfileRepository profileRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private MoneyPocketRepository pocketRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FinancialGoalRepository goalRepository;

    @Autowired
    private JwtService jwtService;

    private User user1;
    private User user2;
    private String token1;
    private String token2;

    @BeforeEach
    void setUp() {
        goalRepository.deleteAll();
        transactionRepository.deleteAll();
        pocketRepository.deleteAll();
        categoryRepository.deleteAll();
        profileRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create User 1
        user1 = userRepository.saveAndFlush(new User("User One", "user1@moneyos.dev", "$2a$10$hash1"));
        token1 = jwtService.generateToken(user1);

        // Profile for User 1
        UserFinancialProfile profile1 = new UserFinancialProfile(user1);
        profile1.setProfessionalStage(ProfessionalStage.EMPLOYED);
        profile1.setEstimatedMonthlyIncome(new BigDecimal("150000.00"));
        profile1.setPreferredCurrency("INR");
        profileRepository.saveAndFlush(profile1);

        // Pocket & Category for User 1
        MoneyPocket pocket1 = pocketRepository.saveAndFlush(new MoneyPocket(user1, "Primary Pocket 1"));
        MoneyPocket pocket1b = pocketRepository.saveAndFlush(new MoneyPocket(user1, "Savings Pocket 1"));
        Category catIncome1 = categoryRepository.saveAndFlush(new Category(user1, "Salary", TransactionType.INCOME));
        Category catExpense1 = categoryRepository.saveAndFlush(new Category(user1, "Groceries", TransactionType.EXPENSE));

        // User 1 Transactions: INCOME 120000, EXPENSE 45000, TRANSFER 10000 (transfers must be excluded)
        transactionRepository.saveAndFlush(new Transaction(
                user1, TransactionType.INCOME, new BigDecimal("120000.00"), "Tech Salary", catIncome1, null, pocket1, LocalDate.now()
        ));
        transactionRepository.saveAndFlush(new Transaction(
                user1, TransactionType.EXPENSE, new BigDecimal("45000.00"), "Supermarket", catExpense1, pocket1, null, LocalDate.now()
        ));
        transactionRepository.saveAndFlush(new Transaction(
                user1, TransactionType.TRANSFER, new BigDecimal("10000.00"), "Move to Savings", null, pocket1, pocket1b, LocalDate.now()
        ));

        // User 1 Goal (Target: 50000, Saved: 50000 -> COMPLETED)
        FinancialGoal goal1 = new FinancialGoal(
                user1, "Emergency Fund", new BigDecimal("50000.00"), new BigDecimal("50000.00"), "INR", LocalDate.now().plusMonths(3)
        );
        goalRepository.saveAndFlush(goal1);

        // 2. Create User 2
        user2 = userRepository.saveAndFlush(new User("User Two", "user2@moneyos.dev", "$2a$10$hash2"));
        token2 = jwtService.generateToken(user2);

        // Profile for User 2
        UserFinancialProfile profile2 = new UserFinancialProfile(user2);
        profile2.setProfessionalStage(ProfessionalStage.FREELANCER);
        profile2.setEstimatedMonthlyIncome(new BigDecimal("80000.00"));
        profile2.setPreferredCurrency("INR");
        profileRepository.saveAndFlush(profile2);

        // Pocket & Category for User 2
        MoneyPocket pocket2 = pocketRepository.saveAndFlush(new MoneyPocket(user2, "Pocket 2"));
        Category catIncome2 = categoryRepository.saveAndFlush(new Category(user2, "Client Payment", TransactionType.INCOME));
        Category catExpense2 = categoryRepository.saveAndFlush(new Category(user2, "Rent", TransactionType.EXPENSE));

        // User 2 Transactions: INCOME 90000, EXPENSE 25000
        transactionRepository.saveAndFlush(new Transaction(
                user2, TransactionType.INCOME, new BigDecimal("90000.00"), "Freelance Gig", catIncome2, null, pocket2, LocalDate.now()
        ));
        transactionRepository.saveAndFlush(new Transaction(
                user2, TransactionType.EXPENSE, new BigDecimal("25000.00"), "Studio Rent", catExpense2, pocket2, null, LocalDate.now()
        ));

        // User 2 Goal (Target: 100000, Saved: 30000, Past target date -> OVERDUE)
        FinancialGoal goal2 = new FinancialGoal(
                user2, "Gear Purchase", new BigDecimal("100000.00"), new BigDecimal("30000.00"), "INR", LocalDate.now().minusDays(10)
        );
        goalRepository.saveAndFlush(goal2);
    }

    @Test
    void user1_shouldSeeOnlyTheirOwnIncomeExpenseAndBudgetCalculations() throws Exception {
        mockMvc.perform(get("/api/profile/financial")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token1)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.professionalStage").value("EMPLOYED"))
                .andExpect(jsonPath("$.estimatedMonthlyIncome").value(150000.0))
                .andExpect(jsonPath("$.preferredCurrency").value("INR"))
                // Budget suggestion assertions:
                .andExpect(jsonPath("$.budgetSuggestion.estimatedMonthlyIncome").value(150000.0))
                .andExpect(jsonPath("$.budgetSuggestion.recordedIncome").value(120000.0))
                .andExpect(jsonPath("$.budgetSuggestion.recordedExpense").value(45000.0))
                // availableToSpend = estimatedMonthlyIncome (150000) - recordedExpense (45000) = 105000
                .andExpect(jsonPath("$.budgetSuggestion.availableToSpend").value(105000.0))
                .andExpect(jsonPath("$.budgetSuggestion.currency").value("INR"))
                // Goals assertions: User 1 sees only their own goal
                .andExpect(jsonPath("$.goalProgress", hasSize(1)))
                .andExpect(jsonPath("$.goalProgress[0].title").value("Emergency Fund"))
                .andExpect(jsonPath("$.goalProgress[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$.goalProgress[0].progressPercentage").value(100.0));
    }

    @Test
    void user2_shouldSeeOnlyTheirOwnIncomeExpenseAndBudgetCalculations() throws Exception {
        mockMvc.perform(get("/api/profile/financial")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token2)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.professionalStage").value("FREELANCER"))
                .andExpect(jsonPath("$.estimatedMonthlyIncome").value(80000.0))
                // Budget suggestion assertions:
                .andExpect(jsonPath("$.budgetSuggestion.estimatedMonthlyIncome").value(80000.0))
                .andExpect(jsonPath("$.budgetSuggestion.recordedIncome").value(90000.0))
                .andExpect(jsonPath("$.budgetSuggestion.recordedExpense").value(25000.0))
                // availableToSpend = estimatedMonthlyIncome (80000) - recordedExpense (25000) = 55000
                .andExpect(jsonPath("$.budgetSuggestion.availableToSpend").value(55000.0))
                .andExpect(jsonPath("$.budgetSuggestion.currency").value("INR"))
                // Goals assertions: User 2 sees only their own goal
                .andExpect(jsonPath("$.goalProgress", hasSize(1)))
                .andExpect(jsonPath("$.goalProgress[0].title").value("Gear Purchase"))
                .andExpect(jsonPath("$.goalProgress[0].status").value("OVERDUE"))
                .andExpect(jsonPath("$.goalProgress[0].progressPercentage").value(30.0));
    }

    @Test
    void crossUserGoalAccess_shouldBePrevented() throws Exception {
        FinancialGoal user1Goal = goalRepository.findAllByUser_Id(user1.getId()).get(0);

        // User 2 attempts to delete User 1's goal
        mockMvc.perform(delete("/api/goals/" + user1Goal.getId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token2))
                .andExpect(status().isNotFound());

        // Goal should still exist for User 1
        assertThat(goalRepository.findById(user1Goal.getId())).isPresent();
    }

    @Test
    void unauthenticatedRequest_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/profile/financial")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
