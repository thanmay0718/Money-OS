package com.moneyos.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String eventType;

    @Column(nullable = false, length = 255)
    private String actorEmail;

    @Column(length = 255)
    private String targetResource;

    @Column(length = 1000)
    private String details;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }

    public AuditLog(String eventType, String actorEmail, String targetResource, String details) {
        this.eventType = eventType;
        this.actorEmail = actorEmail;
        this.targetResource = targetResource;
        this.details = details;
        this.timestamp = Instant.now();
    }
}
