
package com.moneyos.repository;

import com.moneyos.entity.MoneyPocket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MoneyPocketRepository
        extends JpaRepository<MoneyPocket, UUID> {

    List<MoneyPocket> findAllByUser_IdAndActiveTrue(UUID userId);

    Optional<MoneyPocket> findByIdAndUser_IdAndActiveTrue(
            UUID pocketId,
            UUID userId
    );
}
