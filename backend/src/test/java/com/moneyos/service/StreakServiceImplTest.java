package com.moneyos.service;

import com.moneyos.dto.response.StreakDetailsResponse;
import com.moneyos.repository.FinancialActivityRepository;
import com.moneyos.service.impl.StreakServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class StreakServiceImplTest {

    private UUID userId = UUID.randomUUID();
    private LocalDate today = LocalDate.of(2026, 11, 4);

    private FinancialActivityRepository createRepo(List<LocalDate> activeDates) {
        return (FinancialActivityRepository) Proxy.newProxyInstance(
                FinancialActivityRepository.class.getClassLoader(),
                new Class<?>[]{FinancialActivityRepository.class},
                (proxy, method, args) -> {
                    if ("findDistinctActiveDates".equals(method.getName())) {
                        return activeDates;
                    }
                    return null;
                }
        );
    }

    @Test
    @DisplayName("getStreakDetails computes current and longest streak correctly when active today")
    void getStreakDetails_activeToday() {
        List<LocalDate> active = List.of(
                today.minusDays(3),
                today.minusDays(2),
                today.minusDays(1),
                today
        );

        FinancialActivityRepository repo = createRepo(active);
        StreakServiceImpl streakService = new StreakServiceImpl(repo);

        StreakDetailsResponse details = streakService.getStreakDetails(userId, today);

        assertThat(details.currentStreak()).isEqualTo(4);
        assertThat(details.longestStreak()).isEqualTo(4);
        assertThat(details.activeToday()).isTrue();
        assertThat(details.lastActiveDate()).isEqualTo(today);
        assertThat(details.activeDaysThisWeek()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("getStreakDetails maintains current streak if active yesterday but not yet today")
    void getStreakDetails_activeYesterday() {
        List<LocalDate> active = List.of(
                today.minusDays(2),
                today.minusDays(1)
        );

        FinancialActivityRepository repo = createRepo(active);
        StreakServiceImpl streakService = new StreakServiceImpl(repo);

        StreakDetailsResponse details = streakService.getStreakDetails(userId, today);

        assertThat(details.currentStreak()).isEqualTo(2);
        assertThat(details.activeToday()).isFalse();
        assertThat(details.lastActiveDate()).isEqualTo(today.minusDays(1));
    }

    @Test
    @DisplayName("getStreakDetails resets current streak to 0 if gap is 2 or more days")
    void getStreakDetails_brokenStreak() {
        List<LocalDate> active = List.of(
                today.minusDays(5),
                today.minusDays(4),
                today.minusDays(3)
        );

        FinancialActivityRepository repo = createRepo(active);
        StreakServiceImpl streakService = new StreakServiceImpl(repo);

        StreakDetailsResponse details = streakService.getStreakDetails(userId, today);

        assertThat(details.currentStreak()).isEqualTo(0);
        assertThat(details.longestStreak()).isEqualTo(3);
        assertThat(details.activeToday()).isFalse();
    }
}
