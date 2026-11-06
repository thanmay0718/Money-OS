package com.moneyos.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RedeemRewardRequest(
        @NotBlank(message = "Reward code is required")
        String rewardCode
) {}
