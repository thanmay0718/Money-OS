package com.moneyos.service.impl;

import com.moneyos.dto.response.*;
import com.moneyos.entity.Category;
import com.moneyos.entity.Transaction;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.enums.UserRole;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.CategoryRepository;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.AdminService;
import com.moneyos.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.math.BigDecimal;
import java.sql.Connection;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;
    private final DataSource dataSource;

    @Override
    @Transactional(readOnly = true)
    public AdminOverviewResponse getOverview() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByDeletedAtIsNull();
        long deactivatedUsers = userRepository.countByDeletedAtIsNotNull();

        long totalTransactions = transactionRepository.count();

        BigDecimal totalVolume = transactionRepository.sumTotalVolume();
        if (totalVolume == null) totalVolume = BigDecimal.ZERO;

        BigDecimal incomeVolume = transactionRepository.sumVolumeByType(TransactionType.INCOME);
        if (incomeVolume == null) incomeVolume = BigDecimal.ZERO;

        BigDecimal expenseVolume = transactionRepository.sumVolumeByType(TransactionType.EXPENSE);
        if (expenseVolume == null) expenseVolume = BigDecimal.ZERO;

        BigDecimal transferVolume = transactionRepository.sumVolumeByType(TransactionType.TRANSFER);
        if (transferVolume == null) transferVolume = BigDecimal.ZERO;

        long incomeCount = transactionRepository.countByType(TransactionType.INCOME);
        long expenseCount = transactionRepository.countByType(TransactionType.EXPENSE);
        long transferCount = transactionRepository.countByType(TransactionType.TRANSFER);

        List<UserResponse> recentUsers = userRepository
                .findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(this::toUserResponse)
                .getContent();

        List<TransactionResponse> recentTransactions = transactionRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5))
                .stream()
                .map(this::toTransactionResponse)
                .toList();

        List<AuditLogResponse> recentAuditLogs = auditLogService
                .getAuditLogs(PageRequest.of(0, 5))
                .getContent();

        return new AdminOverviewResponse(
                totalUsers,
                activeUsers,
                deactivatedUsers,
                totalTransactions,
                totalVolume,
                incomeVolume,
                expenseVolume,
                transferVolume,
                incomeCount,
                expenseCount,
                transferCount,
                recentUsers,
                recentTransactions,
                recentAuditLogs,
                "HEALTHY"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAnalyticsResponse getAnalytics(int days) {
        int windowDays = (days <= 0 || days > 365) ? 30 : days;
        LocalDate startDate = LocalDate.now().minusDays(windowDays - 1);

        List<Transaction> transactions = transactionRepository.findByTransactionDateGreaterThanEqualOrderByTransactionDateAsc(startDate);
        Instant sinceInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        List<User> newUsers = userRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(sinceInstant);

        // Daily aggregation maps
        Map<LocalDate, Long> txCountMap = new HashMap<>();
        Map<LocalDate, BigDecimal> totalVolMap = new HashMap<>();
        Map<LocalDate, BigDecimal> incomeVolMap = new HashMap<>();
        Map<LocalDate, BigDecimal> expenseVolMap = new HashMap<>();
        Map<LocalDate, BigDecimal> transferVolMap = new HashMap<>();
        Map<LocalDate, Long> userCountMap = new HashMap<>();

        for (Transaction tx : transactions) {
            LocalDate d = tx.getTransactionDate();
            if (d != null && !d.isBefore(startDate)) {
                txCountMap.put(d, txCountMap.getOrDefault(d, 0L) + 1);
                BigDecimal amt = tx.getAmount() != null ? tx.getAmount() : BigDecimal.ZERO;
                totalVolMap.put(d, totalVolMap.getOrDefault(d, BigDecimal.ZERO).add(amt));

                if (tx.getType() == TransactionType.INCOME) {
                    incomeVolMap.put(d, incomeVolMap.getOrDefault(d, BigDecimal.ZERO).add(amt));
                } else if (tx.getType() == TransactionType.EXPENSE) {
                    expenseVolMap.put(d, expenseVolMap.getOrDefault(d, BigDecimal.ZERO).add(amt));
                } else if (tx.getType() == TransactionType.TRANSFER) {
                    transferVolMap.put(d, transferVolMap.getOrDefault(d, BigDecimal.ZERO).add(amt));
                }
            }
        }

        DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE;
        for (User u : newUsers) {
            if (u.getCreatedAt() != null) {
                LocalDate d = u.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate();
                if (!d.isBefore(startDate)) {
                    userCountMap.put(d, userCountMap.getOrDefault(d, 0L) + 1);
                }
            }
        }

        List<AdminAnalyticsResponse.DailyMetric> timeline = new ArrayList<>();
        LocalDate cur = startDate;
        LocalDate today = LocalDate.now();

        while (!cur.isAfter(today)) {
            String dateStr = cur.format(dtf);
            timeline.add(new AdminAnalyticsResponse.DailyMetric(
                    dateStr,
                    txCountMap.getOrDefault(cur, 0L),
                    totalVolMap.getOrDefault(cur, BigDecimal.ZERO),
                    incomeVolMap.getOrDefault(cur, BigDecimal.ZERO),
                    expenseVolMap.getOrDefault(cur, BigDecimal.ZERO),
                    transferVolMap.getOrDefault(cur, BigDecimal.ZERO),
                    userCountMap.getOrDefault(cur, 0L)
            ));
            cur = cur.plusDays(1);
        }

        return new AdminAnalyticsResponse(timeline);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String query, UserRole role, Pageable pageable) {
        boolean hasQuery = query != null && !query.trim().isBlank();
        boolean hasRole = role != null;
        String q = hasQuery ? query.trim() : "";

        Page<User> usersPage;
        if (hasQuery && hasRole) {
            usersPage = userRepository.findByRoleAndFullNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
                    role, q, role, q, pageable
            );
        } else if (hasQuery) {
            usersPage = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    q, q, pageable
            );
        } else if (hasRole) {
            usersPage = userRepository.findAllByRole(role, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        return usersPage.map(this::toUserResponse);
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(UUID userId, UserRole newRole, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail().equalsIgnoreCase(adminEmail) && newRole != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove your own administrative role");
        }

        UserRole oldRole = user.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);

        auditLogService.log(
                "USER_ROLE_CHANGED",
                adminEmail,
                user.getEmail(),
                "Changed role from " + oldRole + " to " + newRole
        );

        return toUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(UUID userId, boolean active, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail().equalsIgnoreCase(adminEmail) && !active) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot deactivate your own administrator account");
        }

        boolean wasActive = user.getDeletedAt() == null;
        if (active) {
            user.setDeletedAt(null);
        } else {
            user.setDeletedAt(Instant.now());
        }
        User saved = userRepository.save(user);

        auditLogService.log(
                "USER_STATUS_CHANGED",
                adminEmail,
                user.getEmail(),
                "Account status changed from " + (wasActive ? "ACTIVE" : "DEACTIVATED") +
                        " to " + (active ? "ACTIVE" : "DEACTIVATED")
        );

        return toUserResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminCategoryResponse> getCategories() {
        return categoryRepository.findAllWithUser().stream()
                .map(c -> new AdminCategoryResponse(
                        c.getId(),
                        c.getName(),
                        c.getType(),
                        c.isActive(),
                        c.getUser() != null ? c.getUser().getEmail() : "System",
                        c.getUser() != null ? c.getUser().getFullName() : "System",
                        c.getCreatedAt()
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SystemHealthResponse getSystemHealth() {
        boolean dbConnected = false;
        long dbLatencyMs = -1;
        long start = System.currentTimeMillis();

        try (Connection conn = dataSource.getConnection()) {
            dbConnected = conn.isValid(2);
            dbLatencyMs = System.currentTimeMillis() - start;
        } catch (Exception e) {
            dbConnected = false;
            dbLatencyMs = -1;
        }

        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        Runtime runtime = Runtime.getRuntime();
        long totalMem = runtime.totalMemory() / (1024 * 1024);
        long freeMem = runtime.freeMemory() / (1024 * 1024);
        long usedMem = totalMem - freeMem;
        long maxMem = runtime.maxMemory() / (1024 * 1024);

        int processors = runtime.availableProcessors();
        int activeThreads = ManagementFactory.getThreadMXBean().getThreadCount();

        return new SystemHealthResponse(
                dbConnected ? "HEALTHY" : "DEGRADED",
                dbConnected,
                dbLatencyMs,
                uptimeSeconds,
                usedMem,
                totalMem,
                maxMem,
                processors,
                activeThreads
        );
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .currency(u.getCurrency())
                .role(u.getRole())
                .createdAt(u.getCreatedAt())
                .deletedAt(u.getDeletedAt())
                .build();
    }

    private TransactionResponse toTransactionResponse(Transaction tx) {
        return new TransactionResponse(
                tx.getId(),
                tx.getType(),
                tx.getAmount(),
                tx.getDescription(),
                tx.getCategory() != null ? tx.getCategory().getId() : null,
                tx.getCategory() != null ? tx.getCategory().getName() : null,
                tx.getFromPocket() != null ? tx.getFromPocket().getId() : null,
                tx.getFromPocket() != null ? tx.getFromPocket().getName() : null,
                tx.getToPocket() != null ? tx.getToPocket().getId() : null,
                tx.getToPocket() != null ? tx.getToPocket().getName() : null,
                tx.getTransactionDate(),
                tx.getCreatedAt()
        );
    }
}
