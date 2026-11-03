package com.moneyos.service;

import com.moneyos.dto.response.AuthResponse;
import com.moneyos.dto.response.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OAuthExchangeCodeServiceTest {

    private OAuthExchangeCodeService service;

    @BeforeEach
    void setUp() {
        service = new OAuthExchangeCodeService();
    }

    @Test
    void exchange_shouldReturnAuthResponse_andInvalidateCodeImmediately() {
        AuthResponse response = AuthResponse.builder()
                .accessToken("test-jwt")
                .tokenType("Bearer")
                .expiresIn(3600L)
                .user(UserResponse.builder().id(UUID.randomUUID()).email("user@test.com").build())
                .build();

        String code = service.create(response);
        assertThat(code).isNotBlank();

        // First exchange succeeds
        AuthResponse exchanged = service.exchange(code);
        assertThat(exchanged.getAccessToken()).isEqualTo("test-jwt");

        // Second exchange fails (single-use)
        assertThatThrownBy(() -> service.exchange(code))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("invalid or expired");
    }

    @Test
    void exchange_shouldRejectBlankOrNullCode() {
        assertThatThrownBy(() -> service.exchange(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("required");

        assertThatThrownBy(() -> service.exchange("  "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("required");
    }
}
