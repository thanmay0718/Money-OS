
package com.moneyos.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "transactions",
        indexes = {
                @Index(
                        name = "idx_transaction_user_created",
                        columnList = "user_id, created_at"
                ),
                @Index(
                        name = "idx_transaction_user_date",
                        columnList = "user_id, transaction_date"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 150)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_pocket_id")
    private MoneyPocket fromPocket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_pocket_id")
    private MoneyPocket toPocket;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();

        if (transactionDate == null) {
            transactionDate = LocalDate.now();
        }
    }

    public Transaction(
            User user,
            TransactionType type,
            BigDecimal amount,
            String description,
            Category category,
            MoneyPocket fromPocket,
            MoneyPocket toPocket,
            LocalDate transactionDate
    ) {
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.category = category;
        this.fromPocket = fromPocket;
        this.toPocket = toPocket;
        this.transactionDate = transactionDate;
    }
}
