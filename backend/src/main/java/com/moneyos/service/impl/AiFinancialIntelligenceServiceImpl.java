package com.moneyos.service.impl;

import com.moneyos.dto.response.AiInsightResponse;
import com.moneyos.dto.response.BudgetRecommendationResponse;
import com.moneyos.dto.response.CashflowForecastResponse;
import com.moneyos.entity.*;
import com.moneyos.repository.*;
import com.moneyos.service.AiFinancialIntelligenceService;
import com.moneyos.service.MoneyPocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiFinancialIntelligenceServiceImpl implements AiFinancialIntelligenceService {

    private final TransactionRepository transactionRepository;
    private final MoneyPocketRepository pocketRepository;
    private final MoneyPocketService moneyPocketService;
    private final RecurringTransactionRepository recurringRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final FinancialGoalRepository goalRepository;

    @Override
    public List<AiInsightResponse> generateInsights(UUID userId) {
        List<AiInsightResponse> insights = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);

        // Fetch user data
        List<MoneyPocket> pockets = pocketRepository.findAllByUser_IdAndActiveTrue(userId);
        BigDecimal totalBalance = pockets.stream()
                .map(pocket -> moneyPocketService.getPocketAvailableBalance(pocket.getId(), userId))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Transaction> allTransactions = transactionRepository.findByUserId(userId);
        List<Transaction> recentExpenses = allTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && !t.getTransactionDate().isBefore(thirtyDaysAgo))
                .toList();

        List<RecurringTransaction> activeRecurring = recurringRepository.findAllByUserIdAndActiveTrueOrderByNextDueDateAsc(userId);

        // 1. Spending Anomaly Detection
        if (!recentExpenses.isEmpty()) {
            double avgSpend = recentExpenses.stream()
                    .mapToDouble(t -> t.getAmount().doubleValue())
                    .average()
                    .orElse(0.0);

            BigDecimal anomalyThreshold = BigDecimal.valueOf(Math.max(avgSpend * 2.2, 50.0));

            // Find most extreme recent expense within the last 10 days
            Optional<Transaction> extremeExpense = recentExpenses.stream()
                    .filter(t -> !t.getTransactionDate().isBefore(today.minusDays(10)))
                    .filter(t -> t.getAmount().compareTo(anomalyThreshold) > 0)
                    .max(Comparator.comparing(Transaction::getAmount));

            extremeExpense.ifPresent(tx -> {
                String catName = tx.getCategory() != null ? tx.getCategory().getName() : "General";
                insights.add(new AiInsightResponse(
                        "insight-anomaly-" + tx.getId(),
                        "Unusual Spending Spike Detected",
                        String.format("Transaction '%s' of %s in %s is significantly higher than your 30-day average of %s.",
                                tx.getDescription(), tx.getAmount(), catName, BigDecimal.valueOf(avgSpend).setScale(2, RoundingMode.HALF_UP)),
                        AiInsightResponse.InsightType.SPENDING_ANOMALY,
                        AiInsightResponse.InsightSeverity.WARNING,
                        catName,
                        tx.getAmount(),
                        "Review this transaction to ensure it was expected or re-allocate pocket funds.",
                        "Inspect Ledger",
                        "/transactions",
                        Instant.now()
                ));
            });
        }

        // 2. Cashflow & Burn Forecast Warning
        BigDecimal totalUpcomingBills = activeRecurring.stream()
                .filter(r -> r.getNextDueDate() != null && !r.getNextDueDate().isAfter(today.plusDays(30)))
                .map(RecurringTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal thirtyDayBurn = recentExpenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal dailyBurnRate = thirtyDayBurn.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
        BigDecimal projectedMonthBurn = dailyBurnRate.multiply(BigDecimal.valueOf(Math.max(1, today.lengthOfMonth() - today.getDayOfMonth())));

        BigDecimal anticipatedOutflow = totalUpcomingBills.add(projectedMonthBurn);
        if (totalBalance.compareTo(anticipatedOutflow) < 0 && anticipatedOutflow.compareTo(BigDecimal.ZERO) > 0) {
            insights.add(new AiInsightResponse(
                    "insight-cashflow-risk",
                    "Cashflow Tightness Ahead",
                    String.format("Your current liquidity (%s) may not cover your anticipated end-of-month outflows (%s upcoming bills + %s projected burn).",
                            totalBalance, totalUpcomingBills, projectedMonthBurn),
                    AiInsightResponse.InsightType.CASHFLOW_WARNING,
                    AiInsightResponse.InsightSeverity.CRITICAL,
                    "Cash Flow",
                    anticipatedOutflow.subtract(totalBalance),
                    "Trim discretionary spending or top up your primary spending pocket to prevent overdraft.",
                    "Review Bills",
                    "/dashboard",
                    Instant.now()
            ));
        }

        // 3. Smart Category Optimization Opportunity
        Map<String, BigDecimal> categorySpend = recentExpenses.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        categorySpend.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(entry -> {
                    BigDecimal potentialSavings = entry.getValue().multiply(BigDecimal.valueOf(0.15)).setScale(2, RoundingMode.HALF_UP);
                    if (potentialSavings.compareTo(BigDecimal.valueOf(10.0)) > 0) {
                        insights.add(new AiInsightResponse(
                                "insight-opt-" + entry.getKey().toLowerCase().replace(" ", "-"),
                                "High-Leverage Savings Target",
                                String.format("'%s' is your highest expenditure category (%s in the last 30 days).",
                                        entry.getKey(), entry.getValue()),
                                AiInsightResponse.InsightType.BUDGET_OPPORTUNITY,
                                AiInsightResponse.InsightSeverity.INFO,
                                entry.getKey(),
                                potentialSavings,
                                String.format("Reducing this category by just 15%% will free up %s every month.", potentialSavings),
                                "Adjust Budget",
                                "/dashboard",
                                Instant.now()
                        ));
                    }
                });

        // 4. Savings Goal Accelerator
        List<FinancialGoal> activeGoals = goalRepository.findAllByUser_Id(userId).stream()
                .filter(g -> g.getStatus() == com.moneyos.enums.GoalStatus.ACTIVE)
                .toList();

        if (!activeGoals.isEmpty()) {
            FinancialGoal topGoal = activeGoals.get(0);
            BigDecimal remaining = topGoal.getTargetAmount().subtract(
                    topGoal.getSavedAmount() != null ? topGoal.getSavedAmount() : BigDecimal.ZERO
            );

            if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                insights.add(new AiInsightResponse(
                        "insight-goal-" + topGoal.getId(),
                        "Goal Fast-Track Opportunity",
                        String.format("You are %s away from completing '%s'.", remaining, topGoal.getTitle()),
                        AiInsightResponse.InsightType.SAVINGS_ACCELERATOR,
                        AiInsightResponse.InsightSeverity.POSITIVE,
                        "Goals",
                        remaining,
                        "Automate a micro-contribution from your daily savings to complete this milestone early.",
                        "Fund Goal",
                        "/dashboard",
                        Instant.now()
                ));
            }
        }

        // 5. Positive Health Check if all active bills are paid
        long overdueBills = activeRecurring.stream()
                .filter(r -> r.getNextDueDate() != null
                        && r.getNextDueDate().isBefore(today)
                        && !today.equals(r.getLastPaidDate()))
                .count();

        if (overdueBills == 0 && !activeRecurring.isEmpty()) {
            insights.add(new AiInsightResponse(
                    "insight-health-bills",
                    "Clean Financial Rhythm",
                    "Zero overdue bills detected. All recurring obligations are scheduled and running smoothly.",
                    AiInsightResponse.InsightType.HEALTH_CHECK,
                    AiInsightResponse.InsightSeverity.POSITIVE,
                    "Obligations",
                    BigDecimal.ZERO,
                    "Keep up this streak to maximize your monthly consistency points and coin rewards.",
                    "View Skyline",
                    "/overview",
                    Instant.now()
            ));
        }

        return insights;
    }

    @Override
    public CashflowForecastResponse getCashflowForecast(UUID userId) {
        LocalDate today = LocalDate.now();
        int daysRemainingInMonth = Math.max(1, today.lengthOfMonth() - today.getDayOfMonth());

        List<MoneyPocket> pockets = pocketRepository.findAllByUser_IdAndActiveTrue(userId);
        BigDecimal currentBalance = pockets.stream()
                .map(pocket -> moneyPocketService.getPocketAvailableBalance(pocket.getId(), userId))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate thirtyDaysAgo = today.minusDays(30);
        BigDecimal thirtyDayExpenses = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, thirtyDaysAgo, today
        );
        if (thirtyDayExpenses == null) thirtyDayExpenses = BigDecimal.ZERO;

        BigDecimal dailyBurnRate = thirtyDayExpenses.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);

        List<RecurringTransaction> activeRecurring = recurringRepository.findAllByUserIdAndActiveTrueOrderByNextDueDateAsc(userId);

        // Build 30-day forward trajectory
        List<CashflowForecastResponse.ForecastPoint> points = new ArrayList<>();
        BigDecimal runningBalance = currentBalance;
        BigDecimal safetyBuffer = currentBalance.multiply(BigDecimal.valueOf(0.15)); // 15% emergency buffer

        for (int i = 0; i <= 30; i++) {
            LocalDate date = today.plusDays(i);
            BigDecimal scheduledBillsOnDate = activeRecurring.stream()
                    .filter(r -> r.getNextDueDate() != null && r.getNextDueDate().isEqual(date))
                    .map(RecurringTransaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (i > 0) {
                runningBalance = runningBalance.subtract(dailyBurnRate).subtract(scheduledBillsOnDate);
            }

            points.add(new CashflowForecastResponse.ForecastPoint(
                    date,
                    runningBalance.setScale(2, RoundingMode.HALF_UP),
                    scheduledBillsOnDate.setScale(2, RoundingMode.HALF_UP),
                    runningBalance.compareTo(safetyBuffer) < 0
            ));
        }

        BigDecimal endOfMonthBalance = points.get(Math.min(daysRemainingInMonth, points.size() - 1)).balance();

        // Calculate safe spend per day
        BigDecimal safeDailySpend = endOfMonthBalance.compareTo(BigDecimal.ZERO) > 0
                ? endOfMonthBalance.divide(BigDecimal.valueOf(daysRemainingInMonth), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String status = endOfMonthBalance.compareTo(safetyBuffer) > 0
                ? "SURPLUS"
                : endOfMonthBalance.compareTo(BigDecimal.ZERO) >= 0
                ? "STABLE"
                : "AT_RISK";

        String commentary = status.equals("SURPLUS")
                ? "Your cash trajectory is healthy with sufficient buffer to fund savings goals."
                : status.equals("STABLE")
                ? "Projected balance is balanced. Maintain spending discipline to avoid dipping below safety buffer."
                : "Warning: Projected burn exceeds current liquidity. Discretionary spending reduction recommended.";

        return new CashflowForecastResponse(
                currentBalance.setScale(2, RoundingMode.HALF_UP),
                dailyBurnRate.setScale(2, RoundingMode.HALF_UP),
                endOfMonthBalance.setScale(2, RoundingMode.HALF_UP),
                safeDailySpend.setScale(2, RoundingMode.HALF_UP),
                "INR",
                daysRemainingInMonth,
                status,
                commentary,
                points
        );
    }

    @Override
    public List<BudgetRecommendationResponse> getBudgetRecommendations(UUID userId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        List<Category> categories = categoryRepository.findAllByUser_IdAndActiveTrue(userId);
        List<BudgetRecommendationResponse> recommendations = new ArrayList<>();

        for (Category cat : categories) {
            BigDecimal currentMonthSpend = transactionRepository.findByUserId(userId).stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .filter(t -> t.getCategory() != null && t.getCategory().getId().equals(cat.getId()))
                    .filter(t -> !t.getTransactionDate().isBefore(startOfMonth) && !t.getTransactionDate().isAfter(today))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (currentMonthSpend.compareTo(BigDecimal.ZERO) > 0) {
                // Recommend 10-15% optimization
                BigDecimal potentialSavings = currentMonthSpend.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);
                BigDecimal recommendedBudget = currentMonthSpend.subtract(potentialSavings).setScale(2, RoundingMode.HALF_UP);

                recommendations.add(new BudgetRecommendationResponse(
                        cat.getId(),
                        cat.getName(),
                        currentMonthSpend.setScale(2, RoundingMode.HALF_UP),
                        recommendedBudget,
                        potentialSavings,
                        "50/30/20 & Run-Rate Optimization",
                        String.format("Based on your monthly run-rate in %s, a %s target maintains lifestyle while saving %s.",
                                cat.getName(), recommendedBudget, potentialSavings),
                        0.88
                ));
            }
        }

        // Sort by highest potential savings
        recommendations.sort((a, b) -> b.potentialMonthlySavings().compareTo(a.potentialMonthlySavings()));
        return recommendations;
    }

    @Override
    public com.moneyos.dto.response.AiChatResponse askCopilot(UUID userId, com.moneyos.dto.request.AiChatRequest request) {
        String msg = request.message().toLowerCase().trim();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        // Gather metrics
        List<MoneyPocket> pockets = pocketRepository.findAllByUser_IdAndActiveTrue(userId);
        BigDecimal totalBalance = pockets.stream()
                .map(pocket -> moneyPocketService.getPocketAvailableBalance(pocket.getId(), userId))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthExpenses = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startOfMonth, today
        );
        if (monthExpenses == null) monthExpenses = BigDecimal.ZERO;

        BigDecimal monthIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.INCOME, startOfMonth, today
        );
        if (monthIncome == null) monthIncome = BigDecimal.ZERO;

        List<RecurringTransaction> activeRecurring = recurringRepository.findAllByUserIdAndActiveTrueOrderByNextDueDateAsc(userId);
        BigDecimal upcomingBillsTotal = activeRecurring.stream()
                .filter(r -> r.getNextDueDate() != null && !r.getNextDueDate().isAfter(today.plusDays(30)))
                .map(RecurringTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<FinancialGoal> goals = goalRepository.findAllByUser_Id(userId);

        Map<String, Object> snapshot = new HashMap<>();
        snapshot.put("totalBalance", totalBalance);
        snapshot.put("monthExpenses", monthExpenses);
        snapshot.put("monthIncome", monthIncome);
        snapshot.put("upcomingBillsCount", activeRecurring.size());
        snapshot.put("upcomingBillsTotal", upcomingBillsTotal);
        snapshot.put("activeGoalsCount", goals.size());

        // Intent detection
        if (msg.contains("afford") || msg.contains("buy") || msg.contains("purchase") || msg.contains("spend")) {
            // Attempt to parse amount
            BigDecimal askAmount = BigDecimal.valueOf(5000);
            Pattern p = Pattern.compile("(?:₹|\\$|rs\\.?|inr)?\\s*([0-9]+(?:,[0-9]+)*(?:\\.[0-9]{2})?)");
            Matcher m = p.matcher(msg);
            while (m.find()) {
                try {
                    String num = m.group(1).replace(",", "");
                    BigDecimal val = new BigDecimal(num);
                    if (val.compareTo(BigDecimal.TEN) > 0) {
                        askAmount = val;
                        break;
                    }
                } catch (Exception ignored) {}
            }

            BigDecimal discretionaryLiquidity = totalBalance.subtract(upcomingBillsTotal);
            String verdict;
            if (discretionaryLiquidity.compareTo(askAmount.multiply(BigDecimal.valueOf(1.5))) >= 0) {
                verdict = String.format("Yes, you can comfortably afford this ₹%s purchase. After reserving ₹%s for upcoming recurring commitments, you will still retain ₹%s in safe liquid cash.",
                        askAmount, upcomingBillsTotal, discretionaryLiquidity.subtract(askAmount));
            } else if (totalBalance.compareTo(askAmount) >= 0) {
                verdict = String.format("Proceed with caution. You have sufficient total balance (₹%s) to cover ₹%s, but your upcoming scheduled bills total ₹%s. This purchase leaves you with tight margins near your safety buffer.",
                        totalBalance, askAmount, upcomingBillsTotal);
            } else {
                verdict = String.format("Not recommended right now. Your total liquidity across pockets is ₹%s, which is below the ₹%s cost (and excludes ₹%s in upcoming scheduled obligations).",
                        totalBalance, askAmount, upcomingBillsTotal);
            }

            return new com.moneyos.dto.response.AiChatResponse(
                    verdict,
                    "AFFORDABILITY",
                    List.of("What bills are due this month?", "Where can I trim expenses?", "View 30-day cash flow projection"),
                    snapshot
            );
        }

        if (msg.contains("bill") || msg.contains("recurring") || msg.contains("subscription") || msg.contains("due")) {
            if (activeRecurring.isEmpty()) {
                return new com.moneyos.dto.response.AiChatResponse(
                        "You have no active recurring commitments or upcoming bills scheduled.",
                        "BILLS",
                        List.of("Set up a recurring bill", "Check cash flow forecast"),
                        snapshot
                );
            }
            StringBuilder sb = new StringBuilder();
            sb.append(String.format("You have %d active recurring obligations totaling ₹%s in the next 30 days:\n",
                    activeRecurring.size(), upcomingBillsTotal));
            for (int i = 0; i < Math.min(3, activeRecurring.size()); i++) {
                RecurringTransaction r = activeRecurring.get(i);
                sb.append(String.format("• %s: ₹%s (Due: %s)\n", r.getName(), r.getAmount(), r.getNextDueDate()));
            }
            return new com.moneyos.dto.response.AiChatResponse(
                    sb.toString().trim(),
                    "BILLS",
                    List.of("Can I afford a ₹10,000 purchase?", "How is my emergency fund doing?"),
                    snapshot
            );
        }

        if (msg.contains("goal") || msg.contains("save") || msg.contains("emergency")) {
            String goalSummary = goals.isEmpty()
                    ? "You haven't set any active savings goals yet. Setting one in the dashboard boosts your habit consistency."
                    : String.format("You are actively tracking %d savings goals. Your top goal has target progress tracked directly on your dashboard.", goals.size());

            return new com.moneyos.dto.response.AiChatResponse(
                    String.format("%s Current monthly savings rate is healthy with ₹%s income and ₹%s expenses recorded.",
                            goalSummary, monthIncome, monthExpenses),
                    "GOALS",
                    List.of("How to accelerate goals?", "Review category budgets"),
                    snapshot
            );
        }

        // Default Financial Health Briefing
        String healthStatus = totalBalance.compareTo(upcomingBillsTotal) >= 0 ? "Strong" : "Attention Needed";
        String reply = String.format(
                "Financial Health Briefing: Overall status is %s. You hold ₹%s in liquid pockets with ₹%s spent this month against ₹%s income. Upcoming bills scheduled: ₹%s. How can I assist you with your budget or investments today?",
                healthStatus, totalBalance, monthExpenses, monthIncome, upcomingBillsTotal
        );

        return new com.moneyos.dto.response.AiChatResponse(
                reply,
                "GENERAL_ADVISORY",
                List.of("Can I afford a ₹15,000 purchase?", "Show upcoming bills", "What is my 30-day cashflow forecast?"),
                snapshot
        );
    }
}
