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
public interface TransactionRepository
        extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findByUserId(UUID userId, Pageable pageable);

    List<Transaction> findByUserId(UUID userId);

    long countByUserId(UUID userId);

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = :type
              AND t.transactionDate >= :startDate
              AND t.transactionDate <= :endDate
            """)
    BigDecimal sumAmountByUserIdAndTypeAndDateRange(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT c.id, COALESCE(c.name, 'Uncategorized'), COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            LEFT JOIN t.category c
            WHERE t.user.id = :userId
              AND t.type = com.moneyos.entity.TransactionType.EXPENSE
              AND t.transactionDate >= :startDate
              AND t.transactionDate <= :endDate
            GROUP BY c.id, c.name
            ORDER BY SUM(t.amount) DESC
            """)
    List<Object[]> sumExpensesByCategoryAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.category.id = :categoryId
              AND t.type = com.moneyos.entity.TransactionType.EXPENSE
              AND t.transactionDate >= :startDate
              AND t.transactionDate <= :endDate
            """)
    BigDecimal sumExpensesByCategoryIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("categoryId") UUID categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT t.transactionDate, t.type, COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.transactionDate >= :startDate
              AND t.transactionDate <= :endDate
              AND (t.type = com.moneyos.entity.TransactionType.INCOME OR t.type = com.moneyos.entity.TransactionType.EXPENSE)
            GROUP BY t.transactionDate, t.type
            ORDER BY t.transactionDate ASC
            """)
    List<Object[]> sumDailyCashFlowByUserIdAndDateRange(
            @Param("userId") UUID userId,
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

    // Alias used by TransactionServiceImpl for paginated user transactions
    Page<Transaction> findAllByUser_Id(UUID userId, Pageable pageable);

    // Admin analytics - total volume across all transactions
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t")
    BigDecimal sumTotalVolume();

    // Admin analytics - volume by transaction type
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type")
    BigDecimal sumVolumeByType(@Param("type") TransactionType type);

    // Dashboard summary - income/expense totals for a user within a date range
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

    // Dashboard summary - all-time income/expense totals for a user
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = :type
            """)
    BigDecimal sumVolumeByUserIdAndType(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type
    );
}
