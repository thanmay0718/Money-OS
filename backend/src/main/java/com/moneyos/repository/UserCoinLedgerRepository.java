package com.moneyos.repository;

import com.moneyos.entity.UserCoinLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCoinLedgerRepository extends JpaRepository<UserCoinLedger, UUID> {

    @Query("SELECT COALESCE(SUM(l.amount), 0L) FROM UserCoinLedger l WHERE l.user.id = :userId")
    Long sumCoinsByUserId(@Param("userId") UUID userId);

    boolean existsByUser_IdAndReferenceTypeAndReferenceId(UUID userId, String referenceType, String referenceId);

    List<UserCoinLedger> findAllByUser_IdAndReferenceType(UUID userId, String referenceType);

    Page<UserCoinLedger> findByUser_IdOrderByAwardedAtDesc(UUID userId, Pageable pageable);
}
