package com.moneyos.entity;

import com.moneyos.enums.NetWorthType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "net_worth_items",
        indexes = {
                @Index(name = "idx_networth_user", columnList = "user_id"),
                @Index(name = "idx_networth_user_type", columnList = "user_id, type")
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NetWorthItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NetWorthType type;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (amount == null) {
            amount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        if (amount == null) {
            amount = BigDecimal.ZERO;
        }
    }

    public NetWorthItem(User user, String name, NetWorthType type, String category, BigDecimal amount) {
        this.user = user;
        this.name = name;
        this.type = type;
        this.category = category != null ? category : "OTHER";
        this.amount = amount != null ? amount : BigDecimal.ZERO;
    }
}
