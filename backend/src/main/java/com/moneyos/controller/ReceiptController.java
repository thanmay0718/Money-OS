package com.moneyos.controller;

import com.moneyos.dto.request.ReceiptScanRequest;
import com.moneyos.dto.request.TransactionRequest;
import com.moneyos.dto.response.ReceiptScanResponse;
import com.moneyos.dto.response.TransactionResponse;
import com.moneyos.entity.User;
import com.moneyos.service.ReceiptOcrService;
import com.moneyos.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptOcrService receiptOcrService;
    private final TransactionService transactionService;

    @PostMapping("/scan")
    public ResponseEntity<ReceiptScanResponse> scanReceipt(
            @AuthenticationPrincipal User user,
            @RequestBody ReceiptScanRequest request
    ) {
        return ResponseEntity.ok(receiptOcrService.scanReceipt(user.getId(), request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<TransactionResponse> confirmReceiptTransaction(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TransactionRequest request
    ) {
        TransactionResponse response = transactionService.createTransaction(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
