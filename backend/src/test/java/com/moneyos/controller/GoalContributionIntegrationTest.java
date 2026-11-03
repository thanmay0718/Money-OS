package com.moneyos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyos.dto.request.GoalContributionRequest;
import com.moneyos.dto.request.TransactionRequest;
import com.moneyos.entity.*;
import com.moneyos.enums.GoalStatus;
import com.moneyos.repository.*;
import com.moneyos.security.JwtService;
import com.moneyos.service.MoneyPocketService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class GoalContributionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MoneyPocketRepository pocketRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private FinancialGoalRepository goalRepository;

    @Autowired
    private GoalContributionRepository contributionRepository;

    @Autowired
    private MoneyPocketService moneyPocketService;

    @Autowired
    private JwtService jwtService;

    private User user1;
    private User user2;
    private String tokenUser1;
    private String tokenUser2;

    private MoneyPocket pocket1;
    private MoneyPocket pocket2;
    private FinancialGoal goal1;

    @BeforeEach
    void setUp() {
        contributionRepository.deleteAll();
        transactionRepository.deleteAll();
        goalRepository.deleteAll();
        pocketRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        user1 = userRepository.save(new User("Alice Developer", "alice.contrib@test.com", "hash"));
        user1.setCurrency("INR");
        user1 = userRepository.save(user1);

        user2 = userRepository.save(new User("Bob Designer", "bob.contrib@test.com", "hash"));
        user2.setCurrency("INR");
        user2 = userRepository.save(user2);

        tokenUser1 = "Bearer " + jwtService.generateToken(user1);
        tokenUser2 = "Bearer " + jwtService.generateToken(user2);

        // Pockets
        pocket1 = pocketRepository.save(new MoneyPocket(user1, "Salary Pocket"));
        pocket2 = pocketRepository.save(new MoneyPocket(user2, "Savings Pocket"));

        // Categories
        Category catIncome = categoryRepository.save(new Category(user1, "Salary", TransactionType.INCOME));

        // Inflow of 50,000 to user1's pocket1
        transactionRepository.save(new Transaction(
                user1,
                TransactionType.INCOME,
                new BigDecimal("50000.00"),
                "Monthly Salary",
                catIncome,
                null,
                pocket1,
                LocalDate.now()
        ));

        // Goal: Buy a BYD, 24,00,000 target, 0 saved
        goal1 = goalRepository.save(new FinancialGoal(
                user1,
                "Buy a BYD",
                new BigDecimal("2400000.00"),
                BigDecimal.ZERO,
                "INR",
                LocalDate.now().plusYears(2)
        ));
    }

    @Test
    void successfulContribution_updatesGoalAndDeductsFromPocketAvailableBalance_withoutImpactingIncomeExpenseAnalytics() throws Exception {
        // Before contribution
        BigDecimal preIncome = transactionRepository.sumVolumeByUserIdAndType(user1.getId(), TransactionType.INCOME);
        BigDecimal preExpense = transactionRepository.sumVolumeByUserIdAndType(user1.getId(), TransactionType.EXPENSE);
        BigDecimal prePocketBalance = moneyPocketService.getPocketAvailableBalance(pocket1.getId(), user1.getId());

        assertThat(preIncome).isEqualByComparingTo("50000.00");
        assertThat(preExpense == null || preExpense.compareTo(BigDecimal.ZERO) == 0).isTrue();
        assertThat(prePocketBalance).isEqualByComparingTo("50000.00");

        // Contribute 10,000 from Salary Pocket
        GoalContributionRequest request = new GoalContributionRequest(
                pocket1.getId(),
                new BigDecimal("10000.00"),
                LocalDate.now(),
                "Monthly BYD savings",
                "contrib-unique-1"
        );

        mockMvc.perform(post("/api/goals/" + goal1.getId() + "/contributions")
                        .header(HttpHeaders.AUTHORIZATION, tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(10000.00))
                .andExpect(jsonPath("$.goalTitle").value("Buy a BYD"))
                .andExpect(jsonPath("$.pocketName").value("Salary Pocket"))
                .andExpect(jsonPath("$.note").value("Monthly BYD savings"))
                .andExpect(jsonPath("$.updatedGoal.savedAmount").value(10000.00))
                .andExpect(jsonPath("$.updatedGoal.remainingAmount").value(2390000.00))
                .andExpect(jsonPath("$.updatedGoal.progressPercentage").value(0.42))
                .andExpect(jsonPath("$.updatedGoal.status").value("ACTIVE"));

        // Verify pocket available balance decreased by 10,000 to 40,000
        BigDecimal postPocketBalance = moneyPocketService.getPocketAvailableBalance(pocket1.getId(), user1.getId());
        assertThat(postPocketBalance).isEqualByComparingTo("40000.00");

        // CRITICAL: Income and Expense analytics MUST remain completely unchanged!
        BigDecimal postIncome = transactionRepository.sumVolumeByUserIdAndType(user1.getId(), TransactionType.INCOME);
        BigDecimal postExpense = transactionRepository.sumVolumeByUserIdAndType(user1.getId(), TransactionType.EXPENSE);
        assertThat(postIncome).isEqualByComparingTo("50000.00");
        assertThat(postExpense == null || postExpense.compareTo(BigDecimal.ZERO) == 0).isTrue();
    }

    @Test
    void insufficientFunds_rejectedWith400() throws Exception {
        // Attempt to contribute 60,000 when only 50,000 is available in pocket1
        GoalContributionRequest request = new GoalContributionRequest(
                pocket1.getId(),
                new BigDecimal("60000.00"),
                LocalDate.now(),
                "Overspending",
                null
        );

        mockMvc.perform(post("/api/goals/" + goal1.getId() + "/contributions")
                        .header(HttpHeaders.AUTHORIZATION, tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        // Verify pocket available balance remains unchanged
        BigDecimal balance = moneyPocketService.getPocketAvailableBalance(pocket1.getId(), user1.getId());
        assertThat(balance).isEqualByComparingTo("50000.00");
    }

    @Test
    void crossUserProtection_cannotContributeToForeignGoalOrUseForeignPocket() throws Exception {
        // User 2 attempts to contribute to User 1's goal
        GoalContributionRequest req1 = new GoalContributionRequest(
                pocket2.getId(),
                new BigDecimal("1000.00"),
                LocalDate.now(),
                "Steal progress",
                null
        );

        mockMvc.perform(post("/api/goals/" + goal1.getId() + "/contributions")
                        .header(HttpHeaders.AUTHORIZATION, tokenUser2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isNotFound());

        // User 1 attempts to contribute using User 2's pocket
        GoalContributionRequest req2 = new GoalContributionRequest(
                pocket2.getId(),
                new BigDecimal("1000.00"),
                LocalDate.now(),
                "Steal funds",
                null
        );

        mockMvc.perform(post("/api/goals/" + goal1.getId() + "/contributions")
                        .header(HttpHeaders.AUTHORIZATION, tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isNotFound());
    }

    @Test
    void contributionHistory_accessibleOnlyByOwner() throws Exception {
        // Add contribution
        GoalContributionRequest request = new GoalContributionRequest(
                pocket1.getId(),
                new BigDecimal("5000.00"),
                LocalDate.now(),
                "First milestone",
                null
        );

        mockMvc.perform(post("/api/goals/" + goal1.getId() + "/contributions")
                        .header(HttpHeaders.AUTHORIZATION, tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // User 1 lists contributions -> succeeds
        mockMvc.perform(get("/api/goals/" + goal1.getId() + "/contributions")
                        .header(HttpHeaders.AUTHORIZATION, tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].amount").value(5000.00))
                .andExpect(jsonPath("$.content[0].note").value("First milestone"));

        // User 2 tries to read User 1's goal contributions -> 404
        mockMvc.perform(get("/api/goals/" + goal1.getId() + "/contributions")
                        .header(HttpHeaders.AUTHORIZATION, tokenUser2))
                .andExpect(status().isNotFound());
    }

    @Test
    void recordIncome_withGoalContribution_processesAtomically() throws Exception {
        FinancialGoal goalUser2 = goalRepository.save(new FinancialGoal(
                user2,
                "Emergency Fund",
                new BigDecimal("100000.00"),
                BigDecimal.ZERO,
                "INR",
                LocalDate.now().plusMonths(6)
        ));
        Category catUser2 = categoryRepository.save(new Category(user2, "Freelance", TransactionType.INCOME));

        TransactionRequest txRequest = new TransactionRequest(
                TransactionType.INCOME,
                new BigDecimal("50000.00"),
                "Client payment",
                catUser2.getId(),
                null,
                pocket2.getId(),
                LocalDate.now(),
                goalUser2.getId(),
                new BigDecimal("15000.00"),
                "Smart income allocation"
        );

        mockMvc.perform(post("/api/transactions")
                        .header(HttpHeaders.AUTHORIZATION, tokenUser2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.amount").value(50000.00))
                .andExpect(jsonPath("$.goalContribution.amount").value(15000.00))
                .andExpect(jsonPath("$.goalContribution.goalTitle").value("Emergency Fund"))
                .andExpect(jsonPath("$.goalContribution.updatedGoal.savedAmount").value(15000.00))
                .andExpect(jsonPath("$.goalContribution.updatedGoal.remainingAmount").value(85000.00));

        // Available balance in pocket2: +50,000 income - 15,000 contribution = 35,000
        BigDecimal p2Balance = moneyPocketService.getPocketAvailableBalance(pocket2.getId(), user2.getId());
        assertThat(p2Balance).isEqualByComparingTo("35000.00");

        // Income volume: exactly 50,000 (not 65,000, not double-counted!)
        BigDecimal user2Income = transactionRepository.sumVolumeByUserIdAndType(user2.getId(), TransactionType.INCOME);
        assertThat(user2Income).isEqualByComparingTo("50000.00");

        // Expense volume: 0 (not recorded as expense!)
        BigDecimal user2Expense = transactionRepository.sumVolumeByUserIdAndType(user2.getId(), TransactionType.EXPENSE);
        assertThat(user2Expense == null || user2Expense.compareTo(BigDecimal.ZERO) == 0).isTrue();
    }

    @Test
    void recordIncome_withGoalContributionExceedingIncome_rejectedWith400() throws Exception {
        Category catUser2 = categoryRepository.save(new Category(user2, "Consulting", TransactionType.INCOME));
        FinancialGoal goalUser2 = goalRepository.save(new FinancialGoal(
                user2,
                "Vacation",
                new BigDecimal("50000.00"),
                BigDecimal.ZERO,
                "INR",
                LocalDate.now().plusMonths(3)
        ));

        TransactionRequest badRequest = new TransactionRequest(
                TransactionType.INCOME,
                new BigDecimal("10000.00"),
                "Small Gig",
                catUser2.getId(),
                null,
                pocket2.getId(),
                LocalDate.now(),
                goalUser2.getId(),
                new BigDecimal("20000.00"),
                "Too much"
        );

        mockMvc.perform(post("/api/transactions")
                        .header(HttpHeaders.AUTHORIZATION, tokenUser2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest());
    }
}
