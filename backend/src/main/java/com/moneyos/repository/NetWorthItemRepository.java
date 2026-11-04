package com.moneyos.repository;

import com.moneyos.entity.NetWorthItem;
import com.moneyos.enums.NetWorthType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NetWorthItemRepository extends JpaRepository<NetWorthItem, UUID> {

    List<NetWorthItem> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    List<NetWorthItem> findAllByUserIdAndTypeOrderByCreatedAtDesc(UUID userId, NetWorthType type);

    Optional<NetWorthItem> findByIdAndUserId(UUID id, UUID userId);
}
