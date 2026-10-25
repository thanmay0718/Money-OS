
package com.moneyos.dto.request;

import com.moneyos.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionRequest(

        @NotNull(message = "Transaction type is required")
        TransactionType type,

        @NotNull(message = "Amount is required")
        @DecimalMin(
                value = "0.01",
                message = "Amount must be greater than zero"
        )
        BigDecimal amount,

        @NotBlank(message = "Description is required")
        @Size(
                max = 150,
                message = "Description cannot exceed 150 characters"
        )
        String description,

        UUID categoryId,

        UUID fromPocketId,

        UUID toPocketId,

        @NotNull(message = "Transaction date is required")
        LocalDate transactionDate

) {}
