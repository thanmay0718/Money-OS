package com.moneyos.service;

import com.moneyos.dto.request.ReceiptScanRequest;
import com.moneyos.dto.response.ReceiptScanResponse;

import java.util.UUID;

public interface ReceiptOcrService {

    ReceiptScanResponse scanReceipt(UUID userId, ReceiptScanRequest request);
}
