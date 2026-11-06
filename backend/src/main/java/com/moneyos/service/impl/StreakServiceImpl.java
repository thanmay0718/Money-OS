package com.moneyos.service.impl;

import com.moneyos.dto.response.StreakDetailsResponse;
import com.moneyos.repository.FinancialActivityRepository;
import com.moneyos.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StreakServiceImpl implements StreakService {

    private final FinancialActivityRepository financialActivityRepository;

    @Override
    public StreakDetailsResponse getStreakDetails(UUID userId, LocalDate referenceDate) {
        LocalDate today = referenceDate != null ? referenceDate : LocalDate.now();

        // Retrieve active dates over the last 400 days
        LocalDate lookbackStart = today.minusDays(400);
        List<LocalDate> rawDates = financialActivityRepository.findDistinctActiveDates(userId, lookbackStart);
        TreeSet<LocalDate> activeDates = new TreeSet<>(rawDates);

        LocalDate lastActiveDate = activeDates.isEmpty() ? null : activeDates.last();
        boolean activeToday = activeDates.contains(today);

        // 1. Current Streak calculation:
        // Streak remains active if user was active today OR yesterday.
        int currentStreak = 0;
        LocalDate cursor = activeDates.contains(today) ? today : (activeDates.contains(today.minusDays(1)) ? today.minusDays(1) : null);

        if (cursor != null) {
            while (activeDates.contains(cursor)) {
                currentStreak++;
                cursor = cursor.minusDays(1);
            }
        }

        // 2. Longest Streak calculation:
        int longestStreak = 0;
        int runningStreak = 0;
        LocalDate prev = null;

        for (LocalDate d : activeDates) {
            if (prev == null) {
                runningStreak = 1;
            } else if (d.equals(prev.plusDays(1))) {
                runningStreak++;
            } else if (!d.equals(prev)) {
                runningStreak = 1;
            }
            if (runningStreak > longestStreak) {
                longestStreak = runningStreak;
            }
            prev = d;
        }

        // 3. Active days this week (Monday through Sunday)
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<Boolean> weekDaysActive = new ArrayList<>(7);
        int activeDaysThisWeek = 0;

        for (int i = 0; i < 7; i++) {
            LocalDate day = monday.plusDays(i);
            boolean isActive = activeDates.contains(day);
            weekDaysActive.add(isActive);
            if (isActive && !day.isAfter(today)) {
                activeDaysThisWeek++;
            }
        }

        double weeklyConsistencyPercentage = Math.round((activeDaysThisWeek / 7.0) * 1000.0) / 10.0;

        // 4. Active days this month (1st of month to today)
        LocalDate firstOfMonth = today.withDayOfMonth(1);
        long activeDaysThisMonth = activeDates.subSet(firstOfMonth, true, today, true).size();

        return new StreakDetailsResponse(
                currentStreak,
                longestStreak,
                activeDaysThisWeek,
                (int) activeDaysThisMonth,
                weeklyConsistencyPercentage,
                activeToday,
                lastActiveDate,
                weekDaysActive
        );
    }
}
