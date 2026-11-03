package com.moneyos.controller;

import com.moneyos.dto.request.FinancialGoalRequest;
import com.moneyos.dto.request.GoalContributionRequest;
import com.moneyos.dto.response.FinancialGoalResponse;
import com.moneyos.dto.response.GoalContributionResponse;
import com.moneyos.entity.User;
import com.moneyos.service.FinancialGoalService;
import com.moneyos.service.GoalContributionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class FinancialGoalController {

    private final FinancialGoalService goalService;
    private final GoalContributionService goalContributionService;

    @GetMapping
    public ResponseEntity<List<FinancialGoalResponse>> getGoals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.getGoalsForUser(user.getId()));
    }

    @PostMapping
    public ResponseEntity<FinancialGoalResponse> createGoal(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody FinancialGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(goalService.createGoal(user, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinancialGoalResponse> updateGoal(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody FinancialGoalRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        goalService.deleteGoal(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/contributions")
    public ResponseEntity<GoalContributionResponse> addContribution(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody GoalContributionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalContributionService.contributeToGoal(user.getId(), id, request));
    }

    @GetMapping("/{id}/contributions")
    public ResponseEntity<Page<GoalContributionResponse>> getContributions(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @PageableDefault(size = 20, sort = "contributionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(goalContributionService.getContributionsForGoal(user.getId(), id, pageable));
    }
}
