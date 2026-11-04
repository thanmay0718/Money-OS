package com.moneyos.service;

import com.moneyos.dto.response.FinancialActivityResponse;
import com.moneyos.dto.response.HeatmapDayDto;
import com.moneyos.dto.response.OverviewSummaryResponse;
import com.moneyos.entity.Budget;
import com.moneyos.entity.FinancialGoal;
import com.moneyos.entity.GoalContribution;
import com.moneyos.entity.MoneyPocket;
import com.moneyos.entity.Transaction;
import com.moneyos.enums.ActivityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface FinancialActivityService {

    // Record activities (called from other services)
    void recordTransactionActivity(UUID userId, Transaction transaction);

    void recordTransactionDeletedActivity(UUID userId, Transaction transaction);

    void recordGoalCreatedActivity(UUID userId, FinancialGoal goal);

    void recordGoalContributionActivity(UUID userId, GoalContribution contribution);

    void recordGoalCompletedActivity(UUID userId, FinancialGoal goal);

    void recordPocketCreatedActivity(UUID userId, MoneyPocket pocket);

    void recordBudgetCreatedActivity(UUID userId, Budget budget);

    void recordBudgetUpdatedActivity(UUID userId, Budget budget);

    // Overview APIs
    OverviewSummaryResponse getSummary(UUID userId, LocalDate startDate, LocalDate endDate);

    List<HeatmapDayDto> getHeatmap(UUID userId, LocalDate startDate, LocalDate endDate);

    Page<FinancialActivityResponse> getTimeline(UUID userId, LocalDate startDate, LocalDate endDate,
                                                List<ActivityType> types, String search, Pageable pageable);

    FinancialActivityResponse getActivityDetail(UUID userId, UUID activityId);

    // Backfill for existing users
    void backfillActivitiesForUser(UUID userId);
}
