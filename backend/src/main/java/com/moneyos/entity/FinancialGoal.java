package com.moneyos.entity;

import com.moneyos.enums.GoalPriority;
import com.moneyos.enums.GoalStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "financial_goals",
        indexes = {
                @Index(name = "idx_goal_user", columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FinancialGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal targetAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal savedAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoalStatus status = GoalStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private GoalPriority priority = GoalPriority.MEDIUM;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (savedAmount == null) {
            savedAmount = BigDecimal.ZERO;
        }
        if (priority == null) {
            priority = GoalPriority.MEDIUM;
        }
        if (currency == null || currency.isBlank()) {
            currency = (user != null && user.getCurrency() != null) ? user.getCurrency() : "INR";
        }
        recalculateStatus(LocalDate.now());
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        if (savedAmount == null) {
            savedAmount = BigDecimal.ZERO;
        }
        if (priority == null) {
            priority = GoalPriority.MEDIUM;
        }
        recalculateStatus(LocalDate.now());
    }

    public void recalculateStatus(LocalDate referenceDate) {
        if (savedAmount == null || targetAmount == null) {
            this.status = GoalStatus.ACTIVE;
            return;
        }
        int cmp = savedAmount.compareTo(targetAmount);
        if (cmp == 0) {
            this.status = GoalStatus.COMPLETED;
        } else if (cmp > 0) {
            this.status = GoalStatus.OVERACHIEVED;
        } else if (targetDate != null && targetDate.isBefore(referenceDate)) {
            this.status = GoalStatus.OVERDUE;
        } else {
            this.status = GoalStatus.ACTIVE;
        }
    }

    public BigDecimal calculateProgressPercentage() {
        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal currentSaved = savedAmount != null ? savedAmount : BigDecimal.ZERO;
        return currentSaved.multiply(BigDecimal.valueOf(100))
                .divide(targetAmount, 2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateRemainingAmount() {
        if (targetAmount == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal currentSaved = savedAmount != null ? savedAmount : BigDecimal.ZERO;
        BigDecimal remaining = targetAmount.subtract(currentSaved);
        return remaining.compareTo(BigDecimal.ZERO) > 0 ? remaining : BigDecimal.ZERO;
    }

    public FinancialGoal(User user, String title, BigDecimal targetAmount, BigDecimal savedAmount, String currency, LocalDate targetDate) {
        this.user = user;
        this.title = title;
        this.targetAmount = targetAmount;
        this.savedAmount = savedAmount != null ? savedAmount : BigDecimal.ZERO;
        this.currency = (currency != null && !currency.isBlank()) ? currency : "INR";
        this.targetDate = targetDate;
        this.priority = GoalPriority.MEDIUM;
        recalculateStatus(LocalDate.now());
    }

    public FinancialGoal(User user, String title, BigDecimal targetAmount, BigDecimal savedAmount, String currency, LocalDate targetDate, GoalPriority priority) {
        this.user = user;
        this.title = title;
        this.targetAmount = targetAmount;
        this.savedAmount = savedAmount != null ? savedAmount : BigDecimal.ZERO;
        this.currency = (currency != null && !currency.isBlank()) ? currency : "INR";
        this.targetDate = targetDate;
        this.priority = priority != null ? priority : GoalPriority.MEDIUM;
        recalculateStatus(LocalDate.now());
    }
}
