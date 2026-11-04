package com.moneyos.repository;

import com.moneyos.entity.FinancialActivity;
import com.moneyos.enums.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialActivityRepository extends JpaRepository<FinancialActivity, UUID>, JpaSpecificationExecutor<FinancialActivity> {

    // Heatmap: aggregate per day
    @Query("""
            SELECT a.activityDate,
                   COUNT(a.id),
                   COALESCE(SUM(CASE WHEN a.activityType = com.moneyos.enums.ActivityType.TRANSACTION_INCOME THEN a.amount END), 0),
                   COALESCE(SUM(CASE WHEN a.activityType = com.moneyos.enums.ActivityType.TRANSACTION_EXPENSE THEN a.amount END), 0),
                   COALESCE(SUM(CASE WHEN a.activityType = com.moneyos.enums.ActivityType.GOAL_CONTRIBUTION THEN a.amount END), 0),
                   COUNT(CASE WHEN a.activityType IN (com.moneyos.enums.ActivityType.TRANSACTION_INCOME, com.moneyos.enums.ActivityType.TRANSACTION_EXPENSE, com.moneyos.enums.ActivityType.TRANSACTION_TRANSFER) THEN 1 END)
            FROM FinancialActivity a
            WHERE a.user.id = :userId
              AND a.activityDate >= :startDate
              AND a.activityDate <= :endDate
            GROUP BY a.activityDate
            ORDER BY a.activityDate ASC
            """)
    List<Object[]> aggregateByDate(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Count total activities in range
    @Query("""
            SELECT COUNT(a) FROM FinancialActivity a
            WHERE a.user.id = :userId
              AND a.activityDate >= :startDate
              AND a.activityDate <= :endDate
            """)
    long countActivitiesInRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Count distinct active days in range
    @Query("""
            SELECT COUNT(DISTINCT a.activityDate) FROM FinancialActivity a
            WHERE a.user.id = :userId
              AND a.activityDate >= :startDate
              AND a.activityDate <= :endDate
            """)
    long countDistinctActiveDaysInRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // All distinct active dates for streak calculation (last 400 days)
    @Query("""
            SELECT DISTINCT a.activityDate FROM FinancialActivity a
            WHERE a.user.id = :userId
              AND a.activityDate >= :startDate
            ORDER BY a.activityDate ASC
            """)
    List<LocalDate> findDistinctActiveDates(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate
    );

    // Check if activity already recorded for a reference (avoid duplicates)
    boolean existsByUser_IdAndActivityTypeAndReferenceId(UUID userId, ActivityType activityType, UUID referenceId);

    // Single activity detail (user-scoped)
    Optional<FinancialActivity> findByIdAndUser_Id(UUID id, UUID userId);

    // Count for analytics
    long countByUser_Id(UUID userId);
}
