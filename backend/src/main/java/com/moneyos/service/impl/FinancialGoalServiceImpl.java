package com.moneyos.service.impl;

import com.moneyos.dto.request.FinancialGoalRequest;
import com.moneyos.dto.response.FinancialGoalResponse;
import com.moneyos.entity.FinancialGoal;
import com.moneyos.entity.User;
import com.moneyos.enums.GoalPriority;
import com.moneyos.enums.GoalStatus;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.FinancialGoalRepository;
import com.moneyos.service.AchievementService;
import com.moneyos.service.FinancialActivityService;
import com.moneyos.service.FinancialGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinancialGoalServiceImpl implements FinancialGoalService {

    private final FinancialGoalRepository goalRepository;
    private final FinancialActivityService financialActivityService;
    private final AchievementService achievementService;

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

        GoalPriority priority = request.priority() != null ? request.priority() : GoalPriority.MEDIUM;

        FinancialGoal goal = new FinancialGoal(
                user,
                request.title().trim(),
                request.targetAmount(),
                request.savedAmount() != null ? request.savedAmount() : BigDecimal.ZERO,
                currency,
                request.targetDate(),
                priority
        );

        FinancialGoal saved = goalRepository.save(goal);
        financialActivityService.recordGoalCreatedActivity(user.getId(), saved);
        evaluateIfCompleted(saved);
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
        if (request.priority() != null) {
            goal.setPriority(request.priority());
        }

        goal.recalculateStatus(LocalDate.now());
        FinancialGoal saved = goalRepository.save(goal);
        evaluateIfCompleted(saved);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteGoal(UUID userId, UUID goalId) {
        FinancialGoal goal = goalRepository.findByIdAndUser_Id(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private void evaluateIfCompleted(FinancialGoal goal) {
        if (goal.getStatus() == GoalStatus.COMPLETED
                || goal.getStatus() == GoalStatus.OVERACHIEVED) {
            achievementService.evaluateAchievements(goal.getUser().getId());
        }
    }

    private FinancialGoalResponse toResponse(FinancialGoal goal) {
        BigDecimal remaining = goal.calculateRemainingAmount();
        BigDecimal progressPct = goal.calculateProgressPercentage();
        LocalDate today = LocalDate.now();

        BigDecimal recommendedMonthly = null;
        LocalDate predictedDate = null;

        if (remaining.compareTo(BigDecimal.ZERO) > 0 && goal.getTargetDate() != null) {
            if (goal.getTargetDate().isAfter(today)) {
                Period period = Period.between(today, goal.getTargetDate());
                int monthsRemaining = Math.max(1, period.getYears() * 12 + period.getMonths());
                recommendedMonthly = remaining.divide(BigDecimal.valueOf(monthsRemaining), 2, RoundingMode.HALF_UP);
                predictedDate = goal.getTargetDate();
            } else {
                recommendedMonthly = remaining;
                predictedDate = today.plusMonths(1);
            }
        }

        String milestoneMessage;
        double pct = progressPct.doubleValue();
        if (pct >= 100.0) {
            milestoneMessage = "Goal fully achieved!";
        } else if (pct >= 75.0) {
            milestoneMessage = "Almost there! Over 75% funded.";
        } else if (pct >= 50.0) {
            milestoneMessage = "Halfway mark passed! You are on track.";
        } else if (pct >= 25.0) {
            milestoneMessage = "Strong momentum! Over 25% funded.";
        } else {
            milestoneMessage = "Goal active. Regular contributions build wealth.";
        }

        return new FinancialGoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getTargetAmount(),
                goal.getSavedAmount(),
                remaining,
                goal.getCurrency(),
                goal.getTargetDate(),
                goal.getStatus(),
                goal.getPriority() != null ? goal.getPriority() : GoalPriority.MEDIUM,
                progressPct,
                predictedDate,
                recommendedMonthly,
                milestoneMessage,
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
