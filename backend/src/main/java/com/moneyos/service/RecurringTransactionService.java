package com.moneyos.service;

import com.moneyos.dto.request.RecurringTransactionRequest;
import com.moneyos.dto.response.RecurringTransactionResponse;
import com.moneyos.entity.User;

import java.util.List;
import java.util.UUID;

public interface RecurringTransactionService {

    List<RecurringTransactionResponse> getRecurringTransactions(UUID userId, Boolean billsOnly);

    RecurringTransactionResponse createRecurringTransaction(User user, RecurringTransactionRequest request);

    RecurringTransactionResponse updateRecurringTransaction(UUID userId, UUID id, RecurringTransactionRequest request);

    void deleteRecurringTransaction(UUID userId, UUID id);

    RecurringTransactionResponse markAsPaid(UUID userId, UUID id);
}
