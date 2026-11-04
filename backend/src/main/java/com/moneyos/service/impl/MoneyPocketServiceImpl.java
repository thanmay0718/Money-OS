package com.moneyos.service.impl;

import com.moneyos.dto.request.MoneyPocketRequest;
import com.moneyos.dto.response.MoneyPocketResponse;
import com.moneyos.entity.MoneyPocket;
import com.moneyos.entity.User;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.GoalContributionRepository;
import com.moneyos.repository.MoneyPocketRepository;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.FinancialActivityService;
import com.moneyos.service.MoneyPocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MoneyPocketServiceImpl implements MoneyPocketService {

    private final MoneyPocketRepository moneyPocketRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final GoalContributionRepository goalContributionRepository;
    private final FinancialActivityService financialActivityService;

    @Override
    @Transactional
    public MoneyPocketResponse createPocket(
            UUID userId,
            MoneyPocketRequest request) {

        User user = userRepository.findById(userId)
                .filter(existing -> existing.getDeletedAt() == null)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        String name = request.name().trim();

        if (name.isBlank()) {
            throw new IllegalArgumentException(
                    "Pocket name cannot be blank");
        }

        MoneyPocket pocket = new MoneyPocket(user, name);
        MoneyPocket saved = moneyPocketRepository.save(pocket);
        financialActivityService.recordPocketCreatedActivity(userId, saved);

        return toResponse(saved, BigDecimal.ZERO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MoneyPocketResponse> getMyPockets(UUID userId) {

        User user = userRepository.findById(userId)
                .filter(existing -> existing.getDeletedAt() == null)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return moneyPocketRepository
                .findAllByUser_IdAndActiveTrue(user.getId())
                .stream()
                .map(pocket -> toResponse(pocket, getPocketAvailableBalance(pocket.getId(), user.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getPocketAvailableBalance(UUID pocketId, UUID userId) {
        BigDecimal inflows = transactionRepository.sumInflowsByPocketIdAndUserId(pocketId, userId);
        BigDecimal outflows = transactionRepository.sumOutflowsByPocketIdAndUserId(pocketId, userId);
        BigDecimal contributions = goalContributionRepository.sumContributionsByPocketIdAndUserId(pocketId, userId);

        return inflows.subtract(outflows).subtract(contributions);
    }

    private MoneyPocketResponse toResponse(MoneyPocket pocket, BigDecimal balance) {
        return new MoneyPocketResponse(
                pocket.getId(),
                pocket.getName(),
                pocket.isActive(),
                pocket.getCreatedAt(),
                pocket.getUpdatedAt(),
                balance != null ? balance : BigDecimal.ZERO
        );
    }
}
