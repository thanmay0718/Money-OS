
package com.moneyos.service;

import com.moneyos.dto.request.TransactionRequest;
import com.moneyos.dto.response.TransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TransactionService {

    TransactionResponse createTransaction(
            UUID userId,
            TransactionRequest request
    );

    Page<TransactionResponse> getMyTransactions(
            UUID userId,
            Pageable pageable
    );
}
