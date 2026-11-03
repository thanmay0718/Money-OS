package com.moneyos.service.impl;

import com.moneyos.dto.request.FinancialGoalRequest;
import com.moneyos.dto.response.FinancialGoalResponse;
import com.moneyos.entity.FinancialGoal;
import com.moneyos.entity.User;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.FinancialGoalRepository;
import com.moneyos.service.FinancialGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinancialGoalServiceImpl implements FinancialGoalService {

    private final FinancialGoalRepository goalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FinancialGoalResponse> getGoalsForUser(UUID userId) {
        LocalDate today = LocalDate.now();
        return goalRepository.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .peek(g -> g.recalculateStatus(today))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public FinancialGoalResponse createGoal(User user, FinancialGoalRequest request) {
        if (request.targetAmount() == null || request.targetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target amount must be greater than zero");
        }
        if (request.savedAmount() != null && request.savedAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Saved amount cannot be negative");
        }
        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Goal title is required");
        }

        String currency = (request.currency() != null && !request.currency().isBlank())
                ? request.currency()
                : (user.getCurrency() != null ? user.getCurrency() : "INR");

        FinancialGoal goal = new FinancialGoal(
                user,
                request.title().trim(),
                request.targetAmount(),
                request.savedAmount() != null ? request.savedAmount() : BigDecimal.ZERO,
                currency,
                request.targetDate()
        );

        FinancialGoal saved = goalRepository.save(goal);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public FinancialGoalResponse updateGoal(UUID userId, UUID goalId, FinancialGoalRequest request) {
        FinancialGoal goal = goalRepository.findByIdAndUser_Id(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (request.targetAmount() != null && request.targetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target amount must be greater than zero");
        }
        if (request.savedAmount() != null && request.savedAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Saved amount cannot be negative");
        }
        if (request.title() != null && request.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Goal title cannot be blank");
        }

        if (request.title() != null) {
            goal.setTitle(request.title().trim());
        }
        if (request.targetAmount() != null) {
            goal.setTargetAmount(request.targetAmount());
        }
        if (request.savedAmount() != null) {
            goal.setSavedAmount(request.savedAmount());
        }
        if (request.currency() != null && !request.currency().isBlank()) {
            goal.setCurrency(request.currency().trim());
        }
        if (request.targetDate() != null) {
            goal.setTargetDate(request.targetDate());
        }

        goal.recalculateStatus(LocalDate.now());
        FinancialGoal saved = goalRepository.save(goal);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteGoal(UUID userId, UUID goalId) {
        FinancialGoal goal = goalRepository.findByIdAndUser_Id(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private FinancialGoalResponse toResponse(FinancialGoal goal) {
        return new FinancialGoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getTargetAmount(),
                goal.getSavedAmount(),
                goal.calculateRemainingAmount(),
                goal.getCurrency(),
                goal.getTargetDate(),
                goal.getStatus(),
                goal.calculateProgressPercentage(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
