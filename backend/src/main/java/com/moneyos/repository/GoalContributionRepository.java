package com.moneyos.repository;

import com.moneyos.entity.GoalContribution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GoalContributionRepository extends JpaRepository<GoalContribution, UUID> {

    Page<GoalContribution> findAllByGoal_IdAndUser_Id(UUID goalId, UUID userId, Pageable pageable);

    List<GoalContribution> findAllByGoal_IdAndUser_IdOrderByContributionDateDescCreatedAtDesc(UUID goalId, UUID userId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM GoalContribution c WHERE c.pocket.id = :pocketId AND c.user.id = :userId")
    BigDecimal sumContributionsByPocketIdAndUserId(@Param("pocketId") UUID pocketId, @Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM GoalContribution c WHERE c.goal.id = :goalId AND c.user.id = :userId")
    BigDecimal sumContributionsByGoalIdAndUserId(@Param("goalId") UUID goalId, @Param("userId") UUID userId);

    Optional<GoalContribution> findByUser_IdAndIdempotencyKey(UUID userId, String idempotencyKey);

    List<GoalContribution> findAllByUser_IdOrderByContributionDateAsc(UUID userId);

    long countByUser_Id(UUID userId);
}
