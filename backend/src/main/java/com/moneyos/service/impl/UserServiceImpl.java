package com.moneyos.service.impl;

import com.moneyos.dto.request.UserRegistrationRequest;
import com.moneyos.dto.response.UserResponse;
import com.moneyos.entity.User;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.AuditLogService;
import com.moneyos.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request) {

        String normalizedEmail =
                request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists"
            );
        }

        String normalizedName = request.getFullName().trim();

        String currency = request.getCurrency() == null
                ? "INR"
                : request.getCurrency().trim().toUpperCase(Locale.ROOT);

        User user = new User(
                normalizedName,
                normalizedEmail,
                passwordEncoder.encode(request.getPassword())
        );

        user.setCurrency(currency);

        User savedUser = userRepository.save(user);

        auditLogService.log(
                "USER_REGISTERED",
                savedUser.getEmail(),
                savedUser.getEmail(),
                "User account self-registered with currency " + currency
        );

        return UserResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .currency(savedUser.getCurrency())
                .role(savedUser.getRole())
                .createdAt(savedUser.getCreatedAt())
                .deletedAt(savedUser.getDeletedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAllActiveUsers(pageable)
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .currency(user.getCurrency())
                        .role(user.getRole())
                        .createdAt(user.getCreatedAt())
                        .deletedAt(user.getDeletedAt())
                        .build());
    }
}
