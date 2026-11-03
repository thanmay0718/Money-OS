package com.moneyos.repository;

import com.moneyos.entity.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, UUID> {

    List<FinancialGoal> findAllByUser_IdOrderByCreatedAtDesc(UUID userId);

    List<FinancialGoal> findAllByUser_Id(UUID userId);

    Optional<FinancialGoal> findByIdAndUser_Id(UUID id, UUID userId);

    boolean existsByIdAndUser_Id(UUID id, UUID userId);

    void deleteByIdAndUser_Id(UUID id, UUID userId);
}
