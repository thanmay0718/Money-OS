
package com.moneyos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyos.dto.request.LoginRequest;
import com.moneyos.dto.response.AuthResponse;
import com.moneyos.dto.response.UserResponse;
import com.moneyos.repository.UserRepository;
import com.moneyos.security.JwtService;
import com.moneyos.service.AuthService;
import com.moneyos.service.TokenRevocationService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private TokenRevocationService tokenRevocationService;

    // Required because JwtAuthenticationFilter depends on UserRepository.
    @MockitoBean
    private UserRepository userRepository;

    @Test
    void login_shouldReturn200_whenCredentialsAreValid() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@moneyos.dev");
        request.setPassword("Password123");

        UserResponse userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .fullName("Test User")
                .email("test@moneyos.dev")
                .currency("INR")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("mock-jwt-token")
                .tokenType("Bearer")
                .expiresIn(3600L)
                .user(userResponse)
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken")
                        .value("mock-jwt-token"))
                .andExpect(jsonPath("$.tokenType")
                        .value("Bearer"))
                .andExpect(jsonPath("$.user.email")
                        .value("test@moneyos.dev"));

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void logout_shouldReturn204_whenBearerTokenIsValid()
            throws Exception {

        String token = "mock-jwt-token";
        String tokenId = "token-id-123";
        Instant expiresAt = Instant.parse("2030-01-01T00:00:00Z");

        when(jwtService.extractTokenId(token))
                .thenReturn(tokenId);

        when(jwtService.extractExpiration(token))
                .thenReturn(expiresAt);

        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf())
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        ))
                .andExpect(status().isNoContent());

        verify(jwtService).extractTokenId(token);
        verify(jwtService).extractExpiration(token);
        verify(tokenRevocationService)
                .revokeToken(tokenId, expiresAt);
    }

    @Test
    void logout_shouldReturn401_whenAuthorizationHeaderIsMissing()
            throws Exception {

        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf()))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(tokenRevocationService);
    }

    @Test
    void logout_shouldReturn401_whenAuthorizationHeaderIsInvalid()
            throws Exception {

        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf())
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Basic abc123"
                        ))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(tokenRevocationService);
    }

    @Test
    void logout_shouldReturn401_whenBearerTokenIsEmpty()
            throws Exception {

        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf())
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer    "
                        ))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(tokenRevocationService);
    }
}
