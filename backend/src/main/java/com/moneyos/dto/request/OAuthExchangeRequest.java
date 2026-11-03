package com.moneyos.dto.request;

import jakarta.validation.constraints.NotBlank;

public record OAuthExchangeRequest(@NotBlank String code) {}
