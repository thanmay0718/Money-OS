package com.moneyos.dto.request;

import com.moneyos.enums.ReviewFrequency;
import jakarta.validation.constraints.Size;

public record FinancialPreferencesRequest(
        ReviewFrequency preferredReviewFrequency,
        Boolean notificationsEnabled,
        @Size(max = 3) String preferredCurrency,
        Boolean personalizationEnabled
) {}
