package com.moneyos.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReceiptScanResponse(
        String merchantName,
        BigDecimal amount,
        BigDecimal taxAmount,
        String currency,
        LocalDate transactionDate,
        UUID suggestedCategoryId,
        String suggestedCategoryName,
        UUID suggestedPocketId,
        String suggestedPocketName,
        double confidence,
        List<String> detectedItems,
        String rawExtractedSummary
) {}
