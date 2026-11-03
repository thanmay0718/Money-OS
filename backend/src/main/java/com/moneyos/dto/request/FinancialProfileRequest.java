package com.moneyos.dto.request;

import com.moneyos.enums.BudgetingStyle;
import com.moneyos.enums.EmploymentType;
import com.moneyos.enums.IncomePattern;
import com.moneyos.enums.LivingArrangement;
import com.moneyos.enums.ProfessionalStage;
import com.moneyos.enums.ReviewFrequency;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record FinancialProfileRequest(
        ProfessionalStage professionalStage,
        EmploymentType employmentType,
        @Size(max = 100) String industry,
        IncomePattern incomePattern,
        @Size(max = 3) String incomeCurrency,
        BigDecimal estimatedMonthlyIncome,
        LivingArrangement livingArrangement,
        BudgetingStyle budgetingStyle,
        ReviewFrequency preferredReviewFrequency,
        Boolean notificationsEnabled,
        @Size(max = 3) String preferredCurrency,
        Boolean personalizationEnabled
) {}
