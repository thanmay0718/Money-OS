package com.moneyos.repository;

import com.moneyos.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findAllByUserIdAndMonthOrderByCreatedAtDesc(UUID userId, String month);

    List<Budget> findAllByUserIdOrderByMonthDescCreatedAtDesc(UUID userId);

    long countByUserId(UUID userId);

    Optional<Budget> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.month = :month AND b.category.id = :categoryId")
    Optional<Budget> findByUserIdAndMonthAndCategoryId(
            @Param("userId") UUID userId,
            @Param("month") String month,
            @Param("categoryId") UUID categoryId
    );
}
