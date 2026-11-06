package com.moneyos.service.impl;

import com.moneyos.dto.request.GoalContributionRequest;
import com.moneyos.dto.response.FinancialGoalResponse;
import com.moneyos.dto.response.GoalContributionResponse;
import com.moneyos.entity.FinancialGoal;
import com.moneyos.entity.GoalContribution;
import com.moneyos.entity.MoneyPocket;
import com.moneyos.entity.User;
import com.moneyos.enums.GoalStatus;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.FinancialGoalRepository;
import com.moneyos.repository.GoalContributionRepository;
import com.moneyos.repository.MoneyPocketRepository;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.FinancialActivityService;
import com.moneyos.service.GoalContributionService;
import com.moneyos.service.AchievementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalContributionServiceImpl implements GoalContributionService {

    private final GoalContributionRepository goalContributionRepository;
    private final FinancialGoalRepository financialGoalRepository;
    private final MoneyPocketRepository moneyPocketRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final FinancialActivityService financialActivityService;
    private final AchievementService achievementService;

    @Override
    @Transactional
    public GoalContributionResponse contributeToGoal(UUID userId, UUID goalId, GoalContributionRequest request) {
        // 1. Validate authenticated user
        User user = userRepository.findById(userId)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Validate contribution amount
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contribution amount must be greater than zero");
        }
        if (request.amount().scale() > 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount cannot have more than 2 decimal places");
        }
        if (request.pocketId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source pocket is required");
        }

        // 3. Check idempotency if key provided
        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            var existing = goalContributionRepository.findByUser_IdAndIdempotencyKey(userId, request.idempotencyKey().trim());
            if (existing.isPresent()) {
                GoalContribution c = existing.get();
                achievementService.evaluateAchievements(userId);
                return toResponse(c, toGoalResponse(c.getGoal()));
            }
        }

        // 4. Verify goal ownership
        FinancialGoal goal = financialGoalRepository.findByIdAndUser_Id(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        // 5. Verify pocket ownership and active status
        MoneyPocket pocket = moneyPocketRepository.findByIdAndUser_IdAndActiveTrue(request.pocketId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Active pocket not found"));

        // 6. Verify sufficient available funds in the pocket
        BigDecimal inflows = transactionRepository.sumInflowsByPocketIdAndUserId(pocket.getId(), userId);
        BigDecimal outflows = transactionRepository.sumOutflowsByPocketIdAndUserId(pocket.getId(), userId);
        BigDecimal priorContributions = goalContributionRepository.sumContributionsByPocketIdAndUserId(pocket.getId(), userId);
        BigDecimal availableBalance = inflows.subtract(outflows).subtract(priorContributions);

        if (availableBalance.compareTo(request.amount()) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient funds in pocket. Available balance is " + availableBalance
            );
        }

        // 7. Record contribution
        LocalDate date = request.contributionDate() != null ? request.contributionDate() : LocalDate.now();
        String note = (request.note() != null && !request.note().isBlank()) ? request.note().trim() : null;
        String idempotencyKey = (request.idempotencyKey() != null && !request.idempotencyKey().isBlank())
                ? request.idempotencyKey().trim()
                : null;

        GoalContribution contribution = new GoalContribution(
                user,
                goal,
                pocket,
                request.amount(),
                date,
                note,
                idempotencyKey
        );
        GoalContribution savedContribution = goalContributionRepository.save(contribution);

        // 8. Update goal saved amount and status
        BigDecimal currentSaved = goal.getSavedAmount() != null ? goal.getSavedAmount() : BigDecimal.ZERO;
        goal.setSavedAmount(currentSaved.add(request.amount()));
        goal.recalculateStatus(LocalDate.now());
        FinancialGoal updatedGoal = financialGoalRepository.save(goal);

        financialActivityService.recordGoalContributionActivity(userId, savedContribution);
        if (updatedGoal.getStatus() == GoalStatus.COMPLETED || updatedGoal.getStatus() == GoalStatus.OVERACHIEVED) {
            financialActivityService.recordGoalCompletedActivity(userId, updatedGoal);
        }
        achievementService.evaluateAchievements(userId);

        return toResponse(savedContribution, toGoalResponse(updatedGoal));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GoalContributionResponse> getContributionsForGoal(UUID userId, UUID goalId, Pageable pageable) {
        FinancialGoal goal = financialGoalRepository.findByIdAndUser_Id(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        FinancialGoalResponse goalResponse = toGoalResponse(goal);

        return goalContributionRepository.findAllByGoal_IdAndUser_Id(goalId, userId, pageable)
                .map(contribution -> toResponse(contribution, goalResponse));
    }

    private GoalContributionResponse toResponse(GoalContribution c, FinancialGoalResponse goalResponse) {
        return new GoalContributionResponse(
                c.getId(),
                c.getGoal().getId(),
                c.getGoal().getTitle(),
                c.getPocket().getId(),
                c.getPocket().getName(),
                c.getAmount(),
                c.getContributionDate(),
                c.getNote(),
                c.getCreatedAt(),
                goalResponse
        );
    }

    private FinancialGoalResponse toGoalResponse(FinancialGoal goal) {
        return new FinancialGoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getTargetAmount(),
                goal.getSavedAmount(),
                goal.getCurrency(),
                goal.getTargetDate(),
                goal.getStatus(),
                goal.calculateProgressPercentage(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
