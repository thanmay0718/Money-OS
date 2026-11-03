package com.moneyos.repository;

import com.moneyos.entity.Transaction;
import com.moneyos.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId")
    Page<Transaction> findAllByUser_Id(
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t")
    BigDecimal sumTotalVolume();

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.type = :type")
    BigDecimal sumVolumeByType(@Param("type") TransactionType type);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumVolumeByUserIdAndType(@Param("userId") UUID userId, @Param("type") TransactionType type);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumVolumeByUserAndType(@Param("userId") UUID userId, @Param("type") TransactionType type);

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = :type
              AND t.transactionDate >= :startDate
              AND t.transactionDate <= :endDate
            """)
    BigDecimal sumVolumeByUserIdTypeAndDateRange(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.toPocket.id = :pocketId AND t.user.id = :userId")
    BigDecimal sumInflowsByPocketIdAndUserId(@Param("pocketId") UUID pocketId, @Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.fromPocket.id = :pocketId AND t.user.id = :userId")
    BigDecimal sumOutflowsByPocketIdAndUserId(@Param("pocketId") UUID pocketId, @Param("userId") UUID userId);

    long countByType(TransactionType type);

    List<Transaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Transaction> findByTransactionDateGreaterThanEqualOrderByTransactionDateAsc(LocalDate startDate);
}
