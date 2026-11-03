package com.moneyos.service;

import com.moneyos.dto.response.*;
import com.moneyos.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AdminService {

    AdminOverviewResponse getOverview();

    AdminAnalyticsResponse getAnalytics(int days);

    Page<UserResponse> getUsers(String query, UserRole role, Pageable pageable);

    UserResponse updateUserRole(UUID userId, UserRole newRole, String adminEmail);

    UserResponse updateUserStatus(UUID userId, boolean active, String adminEmail);

    List<AdminCategoryResponse> getCategories();

    SystemHealthResponse getSystemHealth();
}
