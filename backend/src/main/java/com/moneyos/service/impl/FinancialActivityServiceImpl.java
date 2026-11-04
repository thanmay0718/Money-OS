package com.moneyos.service.impl;

import com.moneyos.dto.response.FinancialActivityResponse;
import com.moneyos.dto.response.HeatmapDayDto;
import com.moneyos.dto.response.OverviewSummaryResponse;
import com.moneyos.entity.*;
import com.moneyos.enums.ActivityReferenceType;
import com.moneyos.enums.ActivityType;
import com.moneyos.enums.GoalStatus;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.*;
import com.moneyos.service.FinancialActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FinancialActivityServiceImpl implements FinancialActivityService {

    private final FinancialActivityRepository financialActivityRepository;
    private final TransactionRepository transactionRepository;
    private final GoalContributionRepository goalContributionRepository;
    private final MoneyPocketRepository moneyPocketRepository;
    private final BudgetRepository budgetRepository;
    private final FinancialGoalRepository financialGoalRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // Record activity methods
    // -------------------------------------------------------------------------

    @Override
    public void recordTransactionActivity(UUID userId, Transaction transaction) {
        User user = resolveUser(userId);

        ActivityType activityType;
        String title;
        String description;

        switch (transaction.getType()) {
            case INCOME -> {
                activityType = ActivityType.TRANSACTION_INCOME;
                title = "Income Added";
                String toPocketName = transaction.getToPocket() != null ? transaction.getToPocket().getName() : "unknown pocket";
                description = transaction.getDescription() + " → " + toPocketName;
            }
            case EXPENSE -> {
                activityType = ActivityType.TRANSACTION_EXPENSE;
                title = "Expense Recorded";
                String fromPocketName = transaction.getFromPocket() != null ? transaction.getFromPocket().getName() : "unknown pocket";
                description = transaction.getDescription() + " from " + fromPocketName;
            }
            case TRANSFER -> {
                activityType = ActivityType.TRANSACTION_TRANSFER;
                title = "Transfer Completed";
                String fromP = transaction.getFromPocket() != null ? transaction.getFromPocket().getName() : "?";
                String toP = transaction.getToPocket() != null ? transaction.getToPocket().getName() : "?";
                description = transaction.getDescription() + " (" + fromP + " → " + toP + ")";
            }
            default -> {
                activityType = ActivityType.TRANSACTION_INCOME;
                title = "Transaction Recorded";
                description = transaction.getDescription();
            }
        }

        FinancialActivity activity = new FinancialActivity(
                user,
                activityType,
                title,
                description,
                ActivityReferenceType.TRANSACTION,
                transaction.getId(),
                transaction.getAmount(),
                transaction.getTransactionDate()
        );

        financialActivityRepository.save(activity);
        log.debug("Recorded {} activity for transaction {}", activityType, transaction.getId());
    }

    @Override
    public void recordTransactionDeletedActivity(UUID userId, Transaction transaction) {
        User user = resolveUser(userId);

        String description = "Removed: " + transaction.getDescription()
                + " (" + transaction.getType() + ", " + transaction.getAmount() + ")";

        FinancialActivity activity = new FinancialActivity(
                user,
                ActivityType.TRANSACTION_DELETED,
                "Transaction Removed",
                description,
                ActivityReferenceType.TRANSACTION,
                transaction.getId(),
                transaction.getAmount(),
                LocalDate.now()
        );

        financialActivityRepository.save(activity);
        log.debug("Recorded TRANSACTION_DELETED activity for transaction {}", transaction.getId());
    }

    @Override
    public void recordGoalCreatedActivity(UUID userId, FinancialGoal goal) {
        User user = resolveUser(userId);

        LocalDate activityDate = goal.getCreatedAt() != null
                ? goal.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate()
                : LocalDate.now();

        String description = "New goal: " + goal.getTitle()
                + " — target " + goal.getCurrency() + " " + goal.getTargetAmount();

        FinancialActivity activity = new FinancialActivity(
                user,
                ActivityType.GOAL_CREATED,
                "Goal Created",
                description,
                ActivityReferenceType.GOAL,
                goal.getId(),
                goal.getTargetAmount(),
                activityDate
        );

        financialActivityRepository.save(activity);
        log.debug("Recorded GOAL_CREATED activity for goal {}", goal.getId());
    }

    @Override
    public void recordGoalContributionActivity(UUID userId, GoalContribution contribution) {
        User user = resolveUser(userId);

        String goalTitle = contribution.getGoal() != null ? contribution.getGoal().getTitle() : "unknown goal";
        String description = "Contributed " + contribution.getAmount() + " to: " + goalTitle;

        FinancialActivity activity = new FinancialActivity(
                user,
                ActivityType.GOAL_CONTRIBUTION,
                "Goal Contribution",
                description,
                ActivityReferenceType.GOAL_CONTRIBUTION,
                contribution.getId(),
                contribution.getAmount(),
                contribution.getContributionDate()
        );

        financialActivityRepository.save(activity);
        log.debug("Recorded GOAL_CONTRIBUTION activity for contribution {}", contribution.getId());
    }

    @Override
    public void recordGoalCompletedActivity(UUID userId, FinancialGoal goal) {
        User user = resolveUser(userId);

        FinancialActivity activity = new FinancialActivity(
                user,
                ActivityType.GOAL_COMPLETED,
                "Goal Completed",
                "Congratulations! You completed: " + goal.getTitle(),
                ActivityReferenceType.GOAL,
                goal.getId(),
                goal.getTargetAmount(),
                LocalDate.now()
        );

        financialActivityRepository.save(activity);
        log.debug("Recorded GOAL_COMPLETED activity for goal {}", goal.getId());
    }

    @Override
    public void recordPocketCreatedActivity(UUID userId, MoneyPocket pocket) {
        User user = resolveUser(userId);

        LocalDate activityDate = pocket.getCreatedAt() != null
                ? pocket.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate()
                : LocalDate.now();

        FinancialActivity activity = new FinancialActivity(
                user,
                ActivityType.POCKET_CREATED,
                "Pocket Created",
                "New pocket: " + pocket.getName(),
                ActivityReferenceType.POCKET,
                pocket.getId(),
                null,
                activityDate
        );

        financialActivityRepository.save(activity);
        log.debug("Recorded POCKET_CREATED activity for pocket {}", pocket.getId());
    }

    @Override
    public void recordBudgetCreatedActivity(UUID userId, Budget budget) {
        User user = resolveUser(userId);

        LocalDate activityDate = budget.getCreatedAt() != null
                ? budget.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate()
                : LocalDate.now();

        String description = "Budget: " + budget.getName() + " for " + budget.getMonth()
                + " — " + budget.getAmount();

        FinancialActivity activity = new FinancialActivity(
                user,
                ActivityType.BUDGET_CREATED,
                "Budget Created",
                description,
                ActivityReferenceType.BUDGET,
                budget.getId(),
                budget.getAmount(),
                activityDate
        );

        financialActivityRepository.save(activity);
        log.debug("Recorded BUDGET_CREATED activity for budget {}", budget.getId());
    }

    @Override
    public void recordBudgetUpdatedActivity(UUID userId, Budget budget) {
        User user = resolveUser(userId);

        String description = "Updated budget: " + budget.getName() + " for " + budget.getMonth()
                + " — new amount " + budget.getAmount();

        FinancialActivity activity = new FinancialActivity(
                user,
                ActivityType.BUDGET_UPDATED,
                "Budget Updated",
                description,
                ActivityReferenceType.BUDGET,
                budget.getId(),
                budget.getAmount(),
                LocalDate.now()
        );

        financialActivityRepository.save(activity);
        log.debug("Recorded BUDGET_UPDATED activity for budget {}", budget.getId());
    }

    // -------------------------------------------------------------------------
    // Overview API methods
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public OverviewSummaryResponse getSummary(UUID userId, LocalDate startDate, LocalDate endDate) {
        long totalActivities = financialActivityRepository.countActivitiesInRange(userId, startDate, endDate);
        long activeDays = financialActivityRepository.countDistinctActiveDaysInRange(userId, startDate, endDate);

        int currentStreak = computeCurrentStreak(userId);
        int longestStreak = computeLongestStreak(userId);

        BigDecimal monthlyIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.INCOME, startDate, endDate);
        if (monthlyIncome == null) monthlyIncome = BigDecimal.ZERO;

        BigDecimal monthlyExpenses = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startDate, endDate);
        if (monthlyExpenses == null) monthlyExpenses = BigDecimal.ZERO;

        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpenses);

        // Compute previous period with same duration
        long periodDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDate prevEnd = startDate.minusDays(1);
        LocalDate prevStart = prevEnd.minusDays(periodDays - 1);

        long previousPeriodActivities = financialActivityRepository.countActivitiesInRange(userId, prevStart, prevEnd);
        long previousPeriodActiveDays = financialActivityRepository.countDistinctActiveDaysInRange(userId, prevStart, prevEnd);

        // Retrieve user currency
        String currency = userRepository.findById(userId)
                .map(User::getCurrency)
                .orElse("INR");

        return new OverviewSummaryResponse(
                totalActivities,
                activeDays,
                currentStreak,
                longestStreak,
                monthlyIncome,
                monthlyExpenses,
                monthlySavings,
                currency,
                previousPeriodActivities,
                previousPeriodActiveDays
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<HeatmapDayDto> getHeatmap(UUID userId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> rows = financialActivityRepository.aggregateByDate(userId, startDate, endDate);

        return rows.stream().map(row -> {
            LocalDate date = (LocalDate) row[0];
            long activityCount = row[1] instanceof Number n ? n.longValue() : 0L;
            BigDecimal income = row[2] instanceof BigDecimal bd ? bd : BigDecimal.ZERO;
            BigDecimal expenses = row[3] instanceof BigDecimal bd ? bd : BigDecimal.ZERO;
            BigDecimal goalContributions = row[4] instanceof BigDecimal bd ? bd : BigDecimal.ZERO;
            long transactionCount = row[5] instanceof Number n ? n.longValue() : 0L;

            int intensity = computeIntensity(activityCount);

            return new HeatmapDayDto(
                    date.toString(),
                    activityCount,
                    transactionCount,
                    income,
                    expenses,
                    goalContributions,
                    intensity
            );
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FinancialActivityResponse> getTimeline(
            UUID userId,
            LocalDate startDate,
            LocalDate endDate,
            List<ActivityType> types,
            String search,
            Pageable pageable
    ) {
        Specification<FinancialActivity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("activityDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("activityDate"), endDate));
            }
            if (types != null && !types.isEmpty()) {
                predicates.add(root.get("activityType").in(types));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return financialActivityRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialActivityResponse getActivityDetail(UUID userId, UUID activityId) {
        FinancialActivity activity = financialActivityRepository.findByIdAndUser_Id(activityId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found"));
        return toResponse(activity);
    }

    // -------------------------------------------------------------------------
    // Backfill
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public void backfillActivitiesForUser(UUID userId) {
        log.info("Starting activity backfill for user {}", userId);

        // 1. Backfill transactions
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        for (Transaction tx : transactions) {
            ActivityType expectedType = switch (tx.getType()) {
                case INCOME -> ActivityType.TRANSACTION_INCOME;
                case EXPENSE -> ActivityType.TRANSACTION_EXPENSE;
                case TRANSFER -> ActivityType.TRANSACTION_TRANSFER;
            };
            if (!financialActivityRepository.existsByUser_IdAndActivityTypeAndReferenceId(userId, expectedType, tx.getId())) {
                recordTransactionActivity(userId, tx);
            }
        }

        // 2. Backfill goal contributions
        List<GoalContribution> contributions = goalContributionRepository
                .findAllByUser_IdOrderByContributionDateAsc(userId);
        for (GoalContribution contrib : contributions) {
            if (!financialActivityRepository.existsByUser_IdAndActivityTypeAndReferenceId(
                    userId, ActivityType.GOAL_CONTRIBUTION, contrib.getId())) {
                recordGoalContributionActivity(userId, contrib);
            }
        }

        // 3. Backfill goals (GOAL_CREATED)
        List<FinancialGoal> goals = financialGoalRepository.findAllByUser_Id(userId);
        for (FinancialGoal goal : goals) {
            if (!financialActivityRepository.existsByUser_IdAndActivityTypeAndReferenceId(
                    userId, ActivityType.GOAL_CREATED, goal.getId())) {
                recordGoalCreatedActivity(userId, goal);
            }
            // Backfill GOAL_COMPLETED for completed/overachieved goals
            if (goal.getStatus() == GoalStatus.COMPLETED || goal.getStatus() == GoalStatus.OVERACHIEVED) {
                if (!financialActivityRepository.existsByUser_IdAndActivityTypeAndReferenceId(
                        userId, ActivityType.GOAL_COMPLETED, goal.getId())) {
                    recordGoalCompletedActivity(userId, goal);
                }
            }
        }

        // 4. Backfill pockets
        List<MoneyPocket> pockets = moneyPocketRepository.findAllByUser_IdOrderByCreatedAtAsc(userId);
        for (MoneyPocket pocket : pockets) {
            if (!financialActivityRepository.existsByUser_IdAndActivityTypeAndReferenceId(
                    userId, ActivityType.POCKET_CREATED, pocket.getId())) {
                recordPocketCreatedActivity(userId, pocket);
            }
        }

        // 5. Backfill budgets
        List<Budget> budgets = budgetRepository.findAllByUserIdOrderByMonthDescCreatedAtDesc(userId);
        for (Budget budget : budgets) {
            if (!financialActivityRepository.existsByUser_IdAndActivityTypeAndReferenceId(
                    userId, ActivityType.BUDGET_CREATED, budget.getId())) {
                recordBudgetCreatedActivity(userId, budget);
            }
        }

        log.info("Completed activity backfill for user {}", userId);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private int computeCurrentStreak(UUID userId) {
        LocalDate cutoff = LocalDate.now().minusDays(400);
        List<LocalDate> activeDates = financialActivityRepository.findDistinctActiveDates(userId, cutoff);

        if (activeDates.isEmpty()) {
            return 0;
        }

        // Build a set for O(1) lookups
        Set<LocalDate> activeDateSet = new HashSet<>(activeDates);

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        // If neither today nor yesterday has activity, streak is 0
        if (!activeDateSet.contains(today) && !activeDateSet.contains(yesterday)) {
            return 0;
        }

        // Start from today if it has activity, otherwise start from yesterday
        LocalDate cursor = activeDateSet.contains(today) ? today : yesterday;

        int streak = 0;
        while (activeDateSet.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }

    private int computeLongestStreak(UUID userId) {
        LocalDate cutoff = LocalDate.now().minusDays(400);
        List<LocalDate> activeDates = financialActivityRepository.findDistinctActiveDates(userId, cutoff);

        if (activeDates.isEmpty()) {
            return 0;
        }

        int maxStreak = 1;
        int currentRun = 1;

        for (int i = 1; i < activeDates.size(); i++) {
            LocalDate prev = activeDates.get(i - 1);
            LocalDate curr = activeDates.get(i);
            if (prev.plusDays(1).equals(curr)) {
                currentRun++;
                if (currentRun > maxStreak) {
                    maxStreak = currentRun;
                }
            } else {
                currentRun = 1;
            }
        }

        return maxStreak;
    }

    private int computeIntensity(long activityCount) {
        if (activityCount == 0) return 0;
        if (activityCount == 1) return 1;
        if (activityCount <= 3) return 2;
        if (activityCount <= 5) return 3;
        return 4;
    }

    private User resolveUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private FinancialActivityResponse toResponse(FinancialActivity activity) {
        return new FinancialActivityResponse(
                activity.getId(),
                activity.getActivityType(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getReferenceType(),
                activity.getReferenceId(),
                activity.getAmount(),
                activity.getActivityDate(),
                activity.getCreatedAt()
        );
    }
}
