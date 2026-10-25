
package com.moneyos.controller;

import com.moneyos.dto.request.TransactionRequest;
import com.moneyos.dto.response.TransactionResponse;
import com.moneyos.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.moneyos.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse createTransaction(
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        return transactionService.createTransaction(
                userId, request);
    }

    @GetMapping
    public Page<TransactionResponse> getMyTransactions(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt")
            Pageable pageable) {

        UUID userId = getAuthenticatedUserId(authentication);

        return transactionService.getMyTransactions(
                userId, pageable);
    }


    private UUID getAuthenticatedUserId(Authentication authentication) {

        if (authentication == null
                || authentication.getPrincipal() == null) {
            throw new org.springframework.security.authentication
                    .AuthenticationCredentialsNotFoundException(
                    "Authentication is required");
        }

        Object principal = authentication.getPrincipal();

        // Your JWT filter appears to store the User entity as principal.
        if (principal instanceof User user) {
            return user.getId();
        }

        // Fallback for configurations that store the UUID as the name.
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "Cannot extract user UUID from authenticated principal",
                    exception);
        }
    }

}
