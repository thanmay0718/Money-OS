package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record NetWorthSummaryResponse(
        BigDecimal totalAssets,
        BigDecimal totalLiabilities,
        BigDecimal netWorth,
        BigDecimal liquidPocketsBalance,
        BigDecimal manualAssetsBalance,
        Map<String, BigDecimal> assetsByCategory,
        Map<String, BigDecimal> liabilitiesByCategory,
        List<NetWorthItemResponse> items
) {}
