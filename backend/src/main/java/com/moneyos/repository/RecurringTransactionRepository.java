package com.moneyos.repository;

import com.moneyos.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {

    List<RecurringTransaction> findAllByUserIdOrderByNextDueDateAsc(UUID userId);

    List<RecurringTransaction> findAllByUserIdAndIsBillTrueOrderByNextDueDateAsc(UUID userId);

    List<RecurringTransaction> findAllByUserIdAndActiveTrueOrderByNextDueDateAsc(UUID userId);

    Optional<RecurringTransaction> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT r FROM RecurringTransaction r WHERE r.user.id = :userId AND r.active = true AND r.nextDueDate <= :cutoffDate ORDER BY r.nextDueDate ASC")
    List<RecurringTransaction> findDueRecurring(
            @Param("userId") UUID userId,
            @Param("cutoffDate") LocalDate cutoffDate
    );
}
