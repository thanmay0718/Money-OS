package com.moneyos.entity;

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
        name = "user_coin_ledgers",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_coin_ref", columnNames = {"user_id", "reference_type", "reference_id"})
        },
        indexes = {
                @Index(name = "idx_user_coin_user", columnList = "user_id"),
                @Index(name = "idx_user_coin_awarded_at", columnList = "user_id, awarded_at")
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserCoinLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false, length = 200)
    private String reason;

    @Column(name = "reference_type", nullable = false, length = 50)
    private String referenceType;

    @Column(name = "reference_id", nullable = false, length = 100)
    private String referenceId;

    @Column(name = "awarded_at", nullable = false, updatable = false)
    private Instant awardedAt;

    public UserCoinLedger(User user, int amount, String reason, String referenceType, String referenceId) {
        this.user = user;
        this.amount = amount;
        this.reason = reason;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.awardedAt = Instant.now();
    }
}
