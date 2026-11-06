package com.moneyos.entity;

import com.moneyos.enums.AchievementCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "user_achievements",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_achievement_code", columnNames = {"user_id", "achievement_code"})
        },
        indexes = {
                @Index(name = "idx_user_achievements_user", columnList = "user_id"),
                @Index(name = "idx_user_achievements_unlocked", columnList = "user_id, unlocked")
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "achievement_code", nullable = false, length = 50)
    private AchievementCode achievementCode;

    @Column(nullable = false)
    private boolean unlocked = false;

    @Column(name = "unlocked_at")
    private Instant unlockedAt;

    @Column(name = "current_progress", nullable = false)
    private int currentProgress = 0;

    @Column(name = "target_progress", nullable = false)
    private int targetProgress = 1;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public UserAchievement(User user, AchievementCode code) {
        this.user = user;
        this.achievementCode = code;
        this.targetProgress = code.getTargetProgress();
        this.currentProgress = 0;
        this.unlocked = false;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
