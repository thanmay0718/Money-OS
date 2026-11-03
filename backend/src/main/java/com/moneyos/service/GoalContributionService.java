package com.moneyos.service;

import com.moneyos.dto.request.GoalContributionRequest;
import com.moneyos.dto.response.GoalContributionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface GoalContributionService {

    GoalContributionResponse contributeToGoal(UUID userId, UUID goalId, GoalContributionRequest request);

    Page<GoalContributionResponse> getContributionsForGoal(UUID userId, UUID goalId, Pageable pageable);
}
