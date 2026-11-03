package com.moneyos.entity;

import com.moneyos.enums.ProfessionalStage;
import com.moneyos.enums.EmploymentType;
import com.moneyos.enums.ReviewFrequency;
import com.moneyos.enums.IncomePattern;
import com.moneyos.enums.LivingArrangement;
import com.moneyos.enums.BudgetingStyle;
import com.moneyos.enums.OnboardingStep;
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
@Table(name = "user_financial_profiles",
       uniqueConstraints = @UniqueConstraint(name = "uk_user_profile_user_id", columnNames = "user_id"),
       indexes = {@Index(name = "idx_profile_user", columnList = "user_id")})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserFinancialProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Column(nullable = false)
    private boolean onboardingCompleted = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "onboarding_step_enum", length = 30)
    private OnboardingStep onboardingStepEnum;

    // Legacy column kept for backward compatibility (can be removed in a later migration)
    @Column(name = "onboarding_step_legacy")
    private String onboardingStep;

    @Column(nullable = false)
    private boolean personalizationEnabled = true;

    // Professional fields
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ProfessionalStage professionalStage;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentType employmentType;

    @Column(length = 100)
    private String industry;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private IncomePattern incomePattern;

    @Column(length = 3)
    private String incomeCurrency;

    @Column(precision = 19, scale = 4)
    private BigDecimal estimatedMonthlyIncome;

    // Living situation
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private LivingArrangement livingArrangement;

    // Preferences
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BudgetingStyle budgetingStyle;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReviewFrequency preferredReviewFrequency;

    @Column(nullable = false)
    private boolean notificationsEnabled = true;

    @Column(length = 3)
    private String preferredCurrency;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public UserFinancialProfile(User user) {
        this.user = user;
    }
}
