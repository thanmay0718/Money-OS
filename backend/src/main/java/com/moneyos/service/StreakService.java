package com.moneyos.service;

import com.moneyos.dto.response.StreakDetailsResponse;

import java.time.LocalDate;
import java.util.UUID;

public interface StreakService {
    StreakDetailsResponse getStreakDetails(UUID userId, LocalDate referenceDate);
}
