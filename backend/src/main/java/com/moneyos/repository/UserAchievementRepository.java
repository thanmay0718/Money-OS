package com.moneyos.repository;

import com.moneyos.entity.UserAchievement;
import com.moneyos.enums.AchievementCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, UUID> {

    List<UserAchievement> findByUser_Id(UUID userId);

    List<UserAchievement> findByUser_IdAndUnlockedTrueOrderByUnlockedAtDesc(UUID userId);

    Optional<UserAchievement> findByUser_IdAndAchievementCode(UUID userId, AchievementCode achievementCode);

    boolean existsByUser_IdAndAchievementCodeAndUnlockedTrue(UUID userId, AchievementCode achievementCode);

    long countByUser_IdAndUnlockedTrue(UUID userId);
}
