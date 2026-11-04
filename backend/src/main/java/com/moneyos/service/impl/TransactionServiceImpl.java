package com.moneyos.service.impl;

import com.moneyos.dto.request.GoalContributionRequest;
import com.moneyos.dto.request.TransactionRequest;
import com.moneyos.dto.response.GoalContributionResponse;
import com.moneyos.dto.response.TransactionResponse;
import com.moneyos.entity.Category;
import com.moneyos.entity.MoneyPocket;
import com.moneyos.entity.Transaction;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.CategoryRepository;
import com.moneyos.repository.MoneyPocketRepository;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.FinancialActivityService;
import com.moneyos.service.GoalContributionService;
import com.moneyos.service.TransactionService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final MoneyPocketRepository moneyPocketRepository;
    private final CategoryRepository categoryRepository;
    private final GoalContributionService goalContributionService;
    private final FinancialActivityService financialActivityService;

    @Override
    @Transactional
    public TransactionResponse createTransaction(
            UUID userId,
            TransactionRequest request) {

        // 1. Validate the user
        User user = userRepository.findById(userId)
                .filter(existingUser -> existingUser.getDeletedAt() == null)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        // 2. Validate basic input
        if (request.amount() == null
                || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw badRequest("Amount must be greater than zero");
        }

        if (request.type() == null) {
            throw badRequest("Transaction type is required");
        }

        if (request.description() == null
                || request.description().isBlank()) {
            throw badRequest("Description is required");
        }

        if (request.transactionDate() == null) {
            throw badRequest("Transaction date is required");
        }

        // 3. Validate and load relationships
        Category category = null;
        MoneyPocket fromPocket = null;
        MoneyPocket toPocket = null;

        switch (request.type()) {

            case INCOME -> {
                if (request.fromPocketId() != null) {
                    throw badRequest(
                            "Income cannot have a source pocket");
                }

                if (request.toPocketId() == null) {
                    throw badRequest(
                            "Income requires a destination pocket");
                }

                if (request.categoryId() == null) {
                    throw badRequest(
                            "Income requires a category");
                }

                toPocket = findPocket(
                        request.toPocketId(), userId);

                category = findCategory(
                        request.categoryId(),
                        userId,
                        TransactionType.INCOME);
            }

            case EXPENSE -> {
                if (request.toPocketId() != null) {
                    throw badRequest(
                            "Expense cannot have a destination pocket");
                }

                if (request.fromPocketId() == null) {
                    throw badRequest(
                            "Expense requires a source pocket");
                }

                if (request.categoryId() == null) {
                    throw badRequest(
                            "Expense requires a category");
                }

                fromPocket = findPocket(
                        request.fromPocketId(), userId);

                category = findCategory(
                        request.categoryId(),
                        userId,
                        TransactionType.EXPENSE);
            }

            case TRANSFER -> {
                if (request.categoryId() != null) {
                    throw badRequest(
                            "Transfer cannot have a category");
                }

                if (request.fromPocketId() == null
                        || request.toPocketId() == null) {
                    throw badRequest(
                            "Transfer requires source and destination pockets");
                }

                if (request.fromPocketId().equals(
                        request.toPocketId())) {
                    throw badRequest(
                            "Source and destination pockets must be different");
                }

                fromPocket = findPocket(
                        request.fromPocketId(), userId);

                toPocket = findPocket(
                        request.toPocketId(), userId);
            }
        }

        // 4. Create the transaction
        Transaction transaction = new Transaction(
                user,
                request.type(),
                request.amount(),
                request.description().trim(),
                category,
                fromPocket,
                toPocket,
                request.transactionDate()
        );

        // 5. Save the transaction
        Transaction saved = transactionRepository.save(transaction);
        financialActivityService.recordTransactionActivity(userId, saved);

        // 6. If goal contribution requested for this income, process it atomically
        GoalContributionResponse contributionResponse = null;
        if (request.goalId() != null && request.goalContributionAmount() != null
                && request.goalContributionAmount().compareTo(BigDecimal.ZERO) > 0) {

            if (request.type() != TransactionType.INCOME) {
                throw badRequest("Goal contribution is only supported for income transactions");
            }

            if (request.goalContributionAmount().compareTo(request.amount()) > 0) {
                throw badRequest("Goal contribution amount cannot exceed the income amount");
            }

            String contribNote = request.goalContributionNote() != null && !request.goalContributionNote().isBlank()
                    ? request.goalContributionNote().trim()
                    : "Income contribution: " + request.description().trim();

            GoalContributionRequest contribRequest = new GoalContributionRequest(
                    toPocket.getId(),
                    request.goalContributionAmount(),
                    request.transactionDate(),
                    contribNote,
                    null
            );

            contributionResponse = goalContributionService.contributeToGoal(userId, request.goalId(), contribRequest);
        }

        return toResponse(saved, contributionResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getMyTransactions(
            UUID userId,
            Pageable pageable) {

        User user = userRepository.findById(userId)
                .filter(existingUser -> existingUser.getDeletedAt() == null)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return transactionRepository
                .findAllByUser_Id(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public void deleteTransaction(UUID userId, UUID transactionId) {
        User user = userRepository.findById(userId)
                .filter(existingUser -> existingUser.getDeletedAt() == null)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Transaction not found"));

        financialActivityService.recordTransactionDeletedActivity(userId, transaction);
        transactionRepository.delete(transaction);
    }

    private MoneyPocket findPocket(UUID pocketId, UUID userId) {
        return moneyPocketRepository
                .findByIdAndUser_IdAndActiveTrue(pocketId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Active pocket not found"));
    }

    private Category findCategory(
            UUID categoryId,
            UUID userId,
            TransactionType type) {

        return categoryRepository
                .findByIdAndUser_IdAndTypeAndActiveTrue(
                        categoryId, userId, type)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Active category not found for this transaction type"));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return toResponse(transaction, null);
    }

    private TransactionResponse toResponse(Transaction transaction, GoalContributionResponse contributionResponse) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getDescription(),

                transaction.getCategory() != null
                        ? transaction.getCategory().getId()
                        : null,

                transaction.getCategory() != null
                        ? transaction.getCategory().getName()
                        : null,

                transaction.getFromPocket() != null
                        ? transaction.getFromPocket().getId()
                        : null,

                transaction.getFromPocket() != null
                        ? transaction.getFromPocket().getName()
                        : null,

                transaction.getToPocket() != null
                        ? transaction.getToPocket().getId()
                        : null,

                transaction.getToPocket() != null
                        ? transaction.getToPocket().getName()
                        : null,

                transaction.getTransactionDate(),
                transaction.getCreatedAt(),
                contributionResponse
        );
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST, message);
    }
}
