
package com.moneyos.service;

import com.moneyos.dto.request.LoginRequest;
import com.moneyos.dto.response.AuthResponse;
import com.moneyos.dto.response.UserResponse;
import com.moneyos.entity.User;
import com.moneyos.repository.UserRepository;
import com.moneyos.security.JwtService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_shouldReturnAuthResponse_whenCredentialsAreValid() {
        LoginRequest request = mock(LoginRequest.class);
        User user = mock(User.class);

        when(request.getEmail()).thenReturn("test@moneyos.dev");
        when(request.getPassword()).thenReturn("Password123");

        when(userRepository.findByEmail("test@moneyos.dev"))
                .thenReturn(Optional.of(user));

        when(user.getDeletedAt()).thenReturn(null);
        when(user.getPasswordHash()).thenReturn("encoded-password");
        when(passwordEncoder.matches("Password123", "encoded-password"))
                .thenReturn(true);

        when(user.getId()).thenReturn(UUID.randomUUID());
        when(user.getFullName()).thenReturn("Test User");
        when(user.getEmail()).thenReturn("test@moneyos.dev");
        when(user.getCurrency()).thenReturn("INR");

        when(jwtService.generateToken(user)).thenReturn("mock-jwt-token");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(3600L, response.getExpiresIn());

        UserResponse userResponse = response.getUser();

        assertNotNull(userResponse);
        assertEquals("Test User", userResponse.getFullName());
        assertEquals("test@moneyos.dev", userResponse.getEmail());
        assertEquals("INR", userResponse.getCurrency());

        verify(userRepository).findByEmail("test@moneyos.dev");
        verify(passwordEncoder).matches("Password123", "encoded-password");
        verify(jwtService).generateToken(user);
    }

    @Test
    void login_shouldNormalizeEmailBeforeSearching() {
        LoginRequest request = mock(LoginRequest.class);
        User user = mock(User.class);

        when(request.getEmail()).thenReturn(" TEST@MONEYOS.DEV ");
        when(request.getPassword()).thenReturn("Password123");

        when(userRepository.findByEmail("test@moneyos.dev"))
                .thenReturn(Optional.of(user));

        when(user.getDeletedAt()).thenReturn(null);
        when(user.getPasswordHash()).thenReturn("encoded-password");
        when(passwordEncoder.matches("Password123", "encoded-password"))
                .thenReturn(true);

        when(user.getId()).thenReturn(UUID.randomUUID());
        when(user.getFullName()).thenReturn("Test User");
        when(user.getEmail()).thenReturn("test@moneyos.dev");
        when(user.getCurrency()).thenReturn("INR");

        when(jwtService.generateToken(user)).thenReturn("mock-jwt-token");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        verify(userRepository).findByEmail("test@moneyos.dev");
    }

    @Test
    void login_shouldThrowException_whenEmailDoesNotExist() {
        LoginRequest request = mock(LoginRequest.class);

        when(request.getEmail()).thenReturn("missing@moneyos.dev");

        when(userRepository.findByEmail("missing@moneyos.dev"))
                .thenReturn(Optional.empty());

        BadCredentialsException exception = assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );

        assertEquals("Invalid email or password", exception.getMessage());

        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).generateToken(any(User.class));
    }

    @Test
    void login_shouldThrowException_whenPasswordIsIncorrect() {
        LoginRequest request = mock(LoginRequest.class);
        User user = mock(User.class);

        when(request.getEmail()).thenReturn("test@moneyos.dev");
        when(request.getPassword()).thenReturn("WrongPassword");

        when(userRepository.findByEmail("test@moneyos.dev"))
                .thenReturn(Optional.of(user));

        when(user.getDeletedAt()).thenReturn(null);
        when(user.getPasswordHash()).thenReturn("encoded-password");

        when(passwordEncoder.matches("WrongPassword", "encoded-password"))
                .thenReturn(false);

        BadCredentialsException exception = assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );

        assertEquals("Invalid email or password", exception.getMessage());

        verify(jwtService, never()).generateToken(any(User.class));
    }

    @Test
    void login_shouldRejectSoftDeletedUser() {
        LoginRequest request = mock(LoginRequest.class);
        User user = mock(User.class);

        when(request.getEmail()).thenReturn("deleted@moneyos.dev");

        when(userRepository.findByEmail("deleted@moneyos.dev"))
                .thenReturn(Optional.of(user));

        when(user.getDeletedAt()).thenReturn(Instant.now());

        BadCredentialsException exception = assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );

        assertEquals("Invalid email or password", exception.getMessage());

        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).generateToken(any(User.class));
    }
}
