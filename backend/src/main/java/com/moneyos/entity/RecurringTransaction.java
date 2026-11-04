package com.moneyos.entity;

import com.moneyos.enums.Frequency;
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
        name = "recurring_transactions",
        indexes = {
                @Index(name = "idx_recurring_user", columnList = "user_id"),
                @Index(name = "idx_recurring_user_due", columnList = "user_id, next_due_date"),
                @Index(name = "idx_recurring_user_bill", columnList = "user_id, is_bill")
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecurringTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type = TransactionType.EXPENSE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Frequency frequency = Frequency.MONTHLY;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pocket_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private MoneyPocket pocket;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "is_bill", nullable = false)
    private boolean isBill = false;

    @Column(name = "last_paid_date")
    private LocalDate lastPaidDate;

    @Column(length = 255)
    private String notes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (nextDueDate == null) {
            nextDueDate = startDate != null ? startDate : LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public RecurringTransaction(
            User user,
            String name,
            BigDecimal amount,
            Category category,
            TransactionType type,
            Frequency frequency,
            LocalDate startDate,
            LocalDate nextDueDate,
            MoneyPocket pocket,
            boolean active,
            boolean isBill,
            String notes
    ) {
        this.user = user;
        this.name = name;
        this.amount = amount;
        this.category = category;
        this.type = type != null ? type : TransactionType.EXPENSE;
        this.frequency = frequency != null ? frequency : Frequency.MONTHLY;
        this.startDate = startDate != null ? startDate : LocalDate.now();
        this.nextDueDate = nextDueDate != null ? nextDueDate : this.startDate;
        this.pocket = pocket;
        this.active = active;
        this.isBill = isBill;
        this.notes = notes;
    }
}
