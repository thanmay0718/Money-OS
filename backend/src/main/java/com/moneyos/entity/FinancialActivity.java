package com.moneyos.entity;

import com.moneyos.enums.ActivityReferenceType;
import com.moneyos.enums.ActivityType;
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
        name = "financial_activities",
        indexes = {
                @Index(name = "idx_activity_user_date", columnList = "user_id, activity_date"),
                @Index(name = "idx_activity_user_type", columnList = "user_id, activity_type"),
                @Index(name = "idx_activity_user_created", columnList = "user_id, created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FinancialActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 30)
    private ActivityType activityType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 30)
    private ActivityReferenceType referenceType;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public FinancialActivity(
            User user,
            ActivityType activityType,
            String title,
            String description,
            ActivityReferenceType referenceType,
            UUID referenceId,
            BigDecimal amount,
            LocalDate activityDate
    ) {
        this.user = user;
        this.activityType = activityType;
        this.title = title;
        this.description = description;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.amount = amount;
        this.activityDate = activityDate;
    }
}
