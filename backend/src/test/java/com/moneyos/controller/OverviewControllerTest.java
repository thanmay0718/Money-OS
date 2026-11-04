package com.moneyos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyos.dto.response.FinancialActivityResponse;
import com.moneyos.dto.response.HeatmapDayDto;
import com.moneyos.dto.response.OverviewSummaryResponse;
import com.moneyos.entity.User;
import com.moneyos.enums.ActivityReferenceType;
import com.moneyos.enums.ActivityType;
import com.moneyos.repository.UserRepository;
import com.moneyos.security.JwtService;
import com.moneyos.service.FinancialActivityService;
import com.moneyos.service.TokenRevocationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OverviewController.class)
@AutoConfigureMockMvc(addFilters = false)
class OverviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FinancialActivityService financialActivityService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private TokenRevocationService tokenRevocationService;

    @MockitoBean
    private UserRepository userRepository;

    private Authentication mockAuth(UUID userId) {
        User user = new User("Test User", "test@moneyos.dev", "hash");
        ReflectionTestUtils.setField(user, "id", userId);
        return new UsernamePasswordAuthenticationToken(user, null, List.of());
    }

    @Test
    @DisplayName("GET /api/overview/summary should return 200 and summary response")
    void getSummary_success() throws Exception {
        UUID userId = UUID.randomUUID();
        Authentication auth = mockAuth(userId);

        OverviewSummaryResponse summary = new OverviewSummaryResponse(
                45L,
                20L,
                5,
                12,
                BigDecimal.valueOf(80000),
                BigDecimal.valueOf(35000),
                BigDecimal.valueOf(45000),
                "INR",
                30L,
                15L
        );

        when(financialActivityService.getSummary(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(summary);

        mockMvc.perform(get("/api/overview/summary")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalActivities").value(45))
                .andExpect(jsonPath("$.activeDays").value(20))
                .andExpect(jsonPath("$.currentStreak").value(5))
                .andExpect(jsonPath("$.monthlySavings").value(45000))
                .andExpect(jsonPath("$.currency").value("INR"));
    }

    @Test
    @DisplayName("GET /api/overview/heatmap should return 200 with list of daily aggregates")
    void getHeatmap_success() throws Exception {
        UUID userId = UUID.randomUUID();
        Authentication auth = mockAuth(userId);

        List<HeatmapDayDto> heatmap = List.of(
                new HeatmapDayDto("2026-10-28", 4, 2, BigDecimal.valueOf(5000), BigDecimal.valueOf(1200), BigDecimal.valueOf(500), 3),
                new HeatmapDayDto("2026-10-29", 1, 1, BigDecimal.ZERO, BigDecimal.valueOf(100), BigDecimal.ZERO, 1)
        );

        when(financialActivityService.getHeatmap(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(heatmap);

        mockMvc.perform(get("/api/overview/heatmap")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].date").value("2026-10-28"))
                .andExpect(jsonPath("$[0].activityCount").value(4))
                .andExpect(jsonPath("$[0].intensity").value(3));
    }

    @Test
    @DisplayName("GET /api/overview/activities should return 200 with paginated timeline")
    void getTimeline_success() throws Exception {
        UUID userId = UUID.randomUUID();
        Authentication auth = mockAuth(userId);

        FinancialActivityResponse item = new FinancialActivityResponse(
                UUID.randomUUID(),
                ActivityType.TRANSACTION_INCOME,
                "Income Added",
                "Salary received in Main Wallet",
                ActivityReferenceType.TRANSACTION,
                UUID.randomUUID(),
                BigDecimal.valueOf(50000),
                LocalDate.now(),
                Instant.now()
        );

        when(financialActivityService.getTimeline(eq(userId), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(item), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/overview/activities")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Income Added"))
                .andExpect(jsonPath("$.content[0].activityType").value("TRANSACTION_INCOME"))
                .andExpect(jsonPath("$.content[0].amount").value(50000));
    }

    @Test
    @DisplayName("POST /api/overview/backfill should return 204 No Content")
    void backfill_success() throws Exception {
        UUID userId = UUID.randomUUID();
        Authentication auth = mockAuth(userId);

        mockMvc.perform(post("/api/overview/backfill")
                        .principal(auth))
                .andExpect(status().isNoContent());
    }
}
