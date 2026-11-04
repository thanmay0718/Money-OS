package com.moneyos.controller;

import com.moneyos.dto.request.RecurringTransactionRequest;
import com.moneyos.dto.response.RecurringTransactionResponse;
import com.moneyos.entity.User;
import com.moneyos.service.RecurringTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;

    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponse>> getRecurring(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Boolean billsOnly) {
        return ResponseEntity.ok(recurringService.getRecurringTransactions(user.getId(), billsOnly));
    }

    @PostMapping
    public ResponseEntity<RecurringTransactionResponse> createRecurring(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody RecurringTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recurringService.createRecurringTransaction(user, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransactionResponse> updateRecurring(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody RecurringTransactionRequest request) {
        return ResponseEntity.ok(recurringService.updateRecurringTransaction(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurring(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        recurringService.deleteRecurringTransaction(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<RecurringTransactionResponse> markAsPaid(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        return ResponseEntity.ok(recurringService.markAsPaid(user.getId(), id));
    }
}
