package com.moneyos.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "goal_contributions",
        indexes = {
                @Index(name = "idx_contribution_goal", columnList = "goal_id"),
                @Index(name = "idx_contribution_user", columnList = "user_id"),
                @Index(name = "idx_contribution_pocket", columnList = "pocket_id"),
                @Index(name = "idx_contribution_user_date", columnList = "user_id, contribution_date")
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GoalContribution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goal_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private FinancialGoal goal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pocket_id", nullable = false)
    private MoneyPocket pocket;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "contribution_date", nullable = false)
    private LocalDate contributionDate;

    @Column(length = 255)
    private String note;

    @Column(name = "idempotency_key", length = 64)
    private String idempotencyKey;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (contributionDate == null) {
            contributionDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public GoalContribution(
            User user,
            FinancialGoal goal,
            MoneyPocket pocket,
            BigDecimal amount,
            LocalDate contributionDate,
            String note,
            String idempotencyKey
    ) {
        this.user = user;
        this.goal = goal;
        this.pocket = pocket;
        this.amount = amount;
        this.contributionDate = contributionDate != null ? contributionDate : LocalDate.now();
        this.note = note;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }
}
