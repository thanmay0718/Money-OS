package com.moneyos.service.impl;

import com.moneyos.dto.request.RecurringTransactionRequest;
import com.moneyos.dto.request.TransactionRequest;
import com.moneyos.dto.response.RecurringTransactionResponse;
import com.moneyos.entity.Category;
import com.moneyos.entity.MoneyPocket;
import com.moneyos.entity.RecurringTransaction;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.enums.BillStatus;
import com.moneyos.enums.Frequency;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.CategoryRepository;
import com.moneyos.repository.MoneyPocketRepository;
import com.moneyos.repository.RecurringTransactionRepository;
import com.moneyos.service.RecurringTransactionService;
import com.moneyos.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepository;
    private final CategoryRepository categoryRepository;
    private final MoneyPocketRepository pocketRepository;
    private final TransactionService transactionService;

    @Override
    @Transactional(readOnly = true)
    public List<RecurringTransactionResponse> getRecurringTransactions(UUID userId, Boolean billsOnly) {
        List<RecurringTransaction> list = Boolean.TRUE.equals(billsOnly)
                ? recurringRepository.findAllByUserIdAndIsBillTrueOrderByNextDueDateAsc(userId)
                : recurringRepository.findAllByUserIdOrderByNextDueDateAsc(userId);

        LocalDate today = LocalDate.now();
        return list.stream()
                .map(r -> toResponse(r, today))
                .toList();
    }

    @Override
    @Transactional
    public RecurringTransactionResponse createRecurringTransaction(User user, RecurringTransactionRequest request) {
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElse(null);
        }

        MoneyPocket pocket = null;
        if (request.pocketId() != null) {
            pocket = pocketRepository.findByIdAndUserId(request.pocketId(), user.getId())
                    .orElse(null);
        }

        LocalDate start = request.startDate() != null ? request.startDate() : LocalDate.now();
        LocalDate nextDue = request.nextDueDate() != null ? request.nextDueDate() : start;

        RecurringTransaction recurring = new RecurringTransaction(
                user,
                request.name().trim(),
                request.amount(),
                category,
                request.type() != null ? request.type() : TransactionType.EXPENSE,
                request.frequency() != null ? request.frequency() : Frequency.MONTHLY,
                start,
                nextDue,
                pocket,
                request.active() != null ? request.active() : true,
                request.isBill() != null ? request.isBill() : false,
                request.notes()
        );

        RecurringTransaction saved = recurringRepository.save(recurring);
        return toResponse(saved, LocalDate.now());
    }

    @Override
    @Transactional
    public RecurringTransactionResponse updateRecurringTransaction(UUID userId, UUID id, RecurringTransactionRequest request) {
        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring commitment not found"));

        if (request.amount() != null && request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }

        if (request.name() != null && !request.name().isBlank()) {
            recurring.setName(request.name().trim());
        }
        if (request.amount() != null) {
            recurring.setAmount(request.amount());
        }
        if (request.type() != null) {
            recurring.setType(request.type());
        }
        if (request.frequency() != null) {
            recurring.setFrequency(request.frequency());
        }
        if (request.startDate() != null) {
            recurring.setStartDate(request.startDate());
        }
        if (request.nextDueDate() != null) {
            recurring.setNextDueDate(request.nextDueDate());
        }
        if (request.active() != null) {
            recurring.setActive(request.active());
        }
        if (request.isBill() != null) {
            recurring.setBill(request.isBill());
        }
        if (request.notes() != null) {
            recurring.setNotes(request.notes());
        }
        if (request.categoryId() != null) {
            Category cat = categoryRepository.findById(request.categoryId()).orElse(null);
            recurring.setCategory(cat);
        }
        if (request.pocketId() != null) {
            MoneyPocket pkt = pocketRepository.findByIdAndUserId(request.pocketId(), userId).orElse(null);
            recurring.setPocket(pkt);
        }

        RecurringTransaction saved = recurringRepository.save(recurring);
        return toResponse(saved, LocalDate.now());
    }

    @Override
    @Transactional
    public void deleteRecurringTransaction(UUID userId, UUID id) {
        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring commitment not found"));
        recurringRepository.delete(recurring);
    }

    @Override
    @Transactional
    public RecurringTransactionResponse markAsPaid(UUID userId, UUID id) {
        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring commitment not found"));

        LocalDate today = LocalDate.now();

        // 1. Create real transaction atomically
        TransactionRequest txRequest = new TransactionRequest(
                recurring.getType() != null ? recurring.getType() : TransactionType.EXPENSE,
                recurring.getAmount(),
                recurring.getName() + " (Auto Bill Settlement)",
                recurring.getCategory() != null ? recurring.getCategory().getId() : null,
                recurring.getPocket() != null ? recurring.getPocket().getId() : null,
                null,
                today,
                null,
                null,
                null
        );
        transactionService.createTransaction(userId, txRequest);

        // 2. Advance nextDueDate based on frequency
        LocalDate nextDate = advanceDueDate(recurring.getNextDueDate(), recurring.getFrequency());
        recurring.setNextDueDate(nextDate);
        recurring.setLastPaidDate(today);

        RecurringTransaction saved = recurringRepository.save(recurring);
        return toResponse(saved, today);
    }

    private LocalDate advanceDueDate(LocalDate current, Frequency freq) {
        if (current == null) current = LocalDate.now();
        if (freq == null) freq = Frequency.MONTHLY;

        return switch (freq) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case YEARLY -> current.plusYears(1);
            case MONTHLY -> current.plusMonths(1);
        };
    }

    private RecurringTransactionResponse toResponse(RecurringTransaction r, LocalDate today) {
        LocalDate due = r.getNextDueDate() != null ? r.getNextDueDate() : today;
        long daysRemaining = ChronoUnit.DAYS.between(today, due);

        BillStatus status;
        if (r.getLastPaidDate() != null && r.getLastPaidDate().equals(today)) {
            status = BillStatus.PAID;
        } else if (daysRemaining < 0) {
            status = BillStatus.OVERDUE;
        } else if (daysRemaining <= 3) {
            status = BillStatus.DUE_SOON;
        } else {
            status = BillStatus.PENDING;
        }

        return new RecurringTransactionResponse(
                r.getId(),
                r.getName(),
                r.getAmount(),
                r.getCategory() != null ? r.getCategory().getId() : null,
                r.getCategory() != null ? r.getCategory().getName() : "General",
                r.getType(),
                r.getFrequency(),
                r.getStartDate(),
                r.getNextDueDate(),
                r.getPocket() != null ? r.getPocket().getId() : null,
                r.getPocket() != null ? r.getPocket().getName() : "Main Pocket",
                r.isActive(),
                r.isBill(),
                status,
                daysRemaining,
                r.getLastPaidDate(),
                r.getNotes(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
