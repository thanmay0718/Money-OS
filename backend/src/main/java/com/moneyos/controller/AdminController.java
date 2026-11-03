package com.moneyos.controller;

import com.moneyos.dto.response.*;
import com.moneyos.entity.User;
import com.moneyos.enums.UserRole;
import com.moneyos.service.AdminService;
import com.moneyos.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewResponse> getOverview() {
        return ResponseEntity.ok(adminService.getOverview());
    }

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics(
            @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(adminService.getAnalytics(days));
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UserRole role,
            @PageableDefault(size = 15, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(adminService.getUsers(query, role, pageable));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String roleStr = body.get("role");
        UserRole newRole = UserRole.valueOf(roleStr.toUpperCase());
        String adminEmail = getAdminEmail(authentication);

        return ResponseEntity.ok(adminService.updateUserRole(id, newRole, adminEmail));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body,
            Authentication authentication
    ) {
        boolean active = Boolean.TRUE.equals(body.get("active"));
        String adminEmail = getAdminEmail(authentication);

        return ResponseEntity.ok(adminService.updateUserStatus(id, active, adminEmail));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<AdminCategoryResponse>> getCategories() {
        return ResponseEntity.ok(adminService.getCategories());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @PageableDefault(size = 20, sort = "timestamp") Pageable pageable
    ) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(pageable));
    }

    @GetMapping("/system-health")
    public ResponseEntity<SystemHealthResponse> getSystemHealth() {
        return ResponseEntity.ok(adminService.getSystemHealth());
    }

    private String getAdminEmail(Authentication authentication) {
        if (authentication == null) {
            return "system.admin@moneyos.com";
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getEmail();
        }
        return authentication.getName();
    }
}
