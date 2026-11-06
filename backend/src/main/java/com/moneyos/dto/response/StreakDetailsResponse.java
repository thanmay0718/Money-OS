package com.moneyos.dto.response;

import java.time.LocalDate;
import java.util.List;

public record StreakDetailsResponse(
        int currentStreak,
        int longestStreak,
        int activeDaysThisWeek,
        int activeDaysThisMonth,
        double weeklyConsistencyPercentage,
        boolean activeToday,
        LocalDate lastActiveDate,
        List<Boolean> weekDaysActive // 7 booleans for Monday through Sunday of current week
) {}
