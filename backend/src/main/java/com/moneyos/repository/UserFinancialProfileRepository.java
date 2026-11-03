package com.moneyos.repository;

import com.moneyos.entity.UserFinancialProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserFinancialProfileRepository extends JpaRepository<UserFinancialProfile, UUID> {
    Optional<UserFinancialProfile> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}
