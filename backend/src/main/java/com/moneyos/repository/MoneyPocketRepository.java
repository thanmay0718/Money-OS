package com.moneyos.repository;

import com.moneyos.entity.MoneyPocket;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MoneyPocketRepository
        extends JpaRepository<MoneyPocket, UUID> {

    @Query("SELECT p FROM MoneyPocket p WHERE p.user.id = :userId AND p.active = true")
    List<MoneyPocket> findAllByUser_IdAndActiveTrue(@Param("userId") UUID userId);

    @Query("SELECT p FROM MoneyPocket p WHERE p.id = :pocketId AND p.user.id = :userId AND p.active = true")
    Optional<MoneyPocket> findByIdAndUser_IdAndActiveTrue(
            @Param("pocketId") UUID pocketId,
            @Param("userId") UUID userId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM MoneyPocket p WHERE p.id = :pocketId AND p.user.id = :userId AND p.active = true")
    Optional<MoneyPocket> findByIdAndUser_IdAndActiveTrueWithLock(
            @Param("pocketId") UUID pocketId,
            @Param("userId") UUID userId
    );

    // Alias used by RecurringTransactionServiceImpl (looks up any active pocket by id + userId)
    @Query("SELECT p FROM MoneyPocket p WHERE p.id = :pocketId AND p.user.id = :userId AND p.active = true")
    Optional<MoneyPocket> findByIdAndUserId(
            @Param("pocketId") UUID pocketId,
            @Param("userId") UUID userId
    );

    @Query("SELECT p FROM MoneyPocket p WHERE p.user.id = :userId ORDER BY p.createdAt ASC")
    List<MoneyPocket> findAllByUser_IdOrderByCreatedAtAsc(@Param("userId") UUID userId);
}
