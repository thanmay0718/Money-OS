package com.moneyos.dto.request;

public record ReceiptScanRequest(
        String imageBase64,
        String fileName,
        String mimeType,
        String rawText
) {}
