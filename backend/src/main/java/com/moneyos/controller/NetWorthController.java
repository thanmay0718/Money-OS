package com.moneyos.controller;

import com.moneyos.dto.request.NetWorthItemRequest;
import com.moneyos.dto.response.NetWorthItemResponse;
import com.moneyos.dto.response.NetWorthSummaryResponse;
import com.moneyos.entity.User;
import com.moneyos.service.NetWorthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/net-worth")
@RequiredArgsConstructor
public class NetWorthController {

    private final NetWorthService netWorthService;

    @GetMapping
    public ResponseEntity<NetWorthSummaryResponse> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(netWorthService.getNetWorthSummary(user.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<NetWorthItemResponse> addItem(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NetWorthItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(netWorthService.addItem(user, request));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        netWorthService.deleteItem(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
