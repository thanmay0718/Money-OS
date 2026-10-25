
package com.moneyos.service.impl;

import com.moneyos.dto.request.UserRegistrationRequest;
import com.moneyos.dto.response.UserResponse;
import com.moneyos.entity.User;
import com.moneyos.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Mock
    private UserRegistrationRequest request;

    @Test
    void registerUser_shouldRegisterUserSuccessfully() {

        // Arrange: registration request
        when(request.getFullName()).thenReturn(" Test User ");
        when(request.getEmail()).thenReturn(" TEST@MONEYOS.DEV ");
        when(request.getPassword()).thenReturn("PlainPassword123");
        when(request.getCurrency()).thenReturn("INR");

        when(userRepository.existsByEmail("test@moneyos.dev"))
                .thenReturn(false);

        when(passwordEncoder.encode("PlainPassword123"))
                .thenReturn("encoded-password");

        UUID userId = UUID.randomUUID();

        User savedUser = mock(User.class);

        when(savedUser.getId()).thenReturn(userId);
        when(savedUser.getFullName()).thenReturn("Test User");
        when(savedUser.getEmail()).thenReturn("test@moneyos.dev");
        when(savedUser.getCurrency()).thenReturn("INR");

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        // Act
        UserResponse response = userService.registerUser(request);

        // Assert: response
        assertNotNull(response);
        assertEquals(userId, response.getId());
        assertEquals("Test User", response.getFullName());
        assertEquals("test@moneyos.dev", response.getEmail());
        assertEquals("INR", response.getCurrency());

        // Assert: entity passed to repository
        ArgumentCaptor<User> captor =
                ArgumentCaptor.forClass(User.class);

        verify(userRepository).save(captor.capture());

        User userToSave = captor.getValue();

        assertEquals("Test User", userToSave.getFullName());
        assertEquals("test@moneyos.dev", userToSave.getEmail());
        assertEquals(
                "encoded-password",
                userToSave.getPasswordHash()
        );
        assertEquals("INR", userToSave.getCurrency());

        verify(passwordEncoder).encode("PlainPassword123");
    }

    @Test
    void registerUser_shouldDefaultCurrencyToINRWhenCurrencyIsNull() {

        // Arrange
        when(request.getFullName()).thenReturn(" Test User ");
        when(request.getEmail()).thenReturn(" TEST@MONEYOS.DEV ");
        when(request.getPassword()).thenReturn("PlainPassword123");
        when(request.getCurrency()).thenReturn(null);

        when(userRepository.existsByEmail("test@moneyos.dev"))
                .thenReturn(false);

        when(passwordEncoder.encode("PlainPassword123"))
                .thenReturn("encoded-password");

        UUID userId = UUID.randomUUID();

        User savedUser = mock(User.class);

        when(savedUser.getId()).thenReturn(userId);
        when(savedUser.getFullName()).thenReturn("Test User");
        when(savedUser.getEmail()).thenReturn("test@moneyos.dev");
        when(savedUser.getCurrency()).thenReturn("INR");

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        // Act
        UserResponse response = userService.registerUser(request);

        // Assert
        assertNotNull(response);
        assertEquals("INR", response.getCurrency());

        ArgumentCaptor<User> captor =
                ArgumentCaptor.forClass(User.class);

        verify(userRepository).save(captor.capture());

        assertEquals("INR", captor.getValue().getCurrency());
    }

    @Test
    void registerUser_shouldThrowExceptionWhenEmailAlreadyExists() {

        // Arrange
        when(request.getEmail()).thenReturn(" TEST@MONEYOS.DEV ");

        when(userRepository.existsByEmail("test@moneyos.dev"))
                .thenReturn(true);

        // Act + Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(request)
        );

        assertEquals(
                "An account with this email already exists",
                exception.getMessage()
        );

        // No user should be saved or password encoded
        verify(userRepository, never()).save(any(User.class));

        verify(passwordEncoder, never())
                .encode(any(String.class));
    }

    @Test
    void getAllUsers_shouldReturnPagedUserResponses() {

        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        UUID userId = UUID.randomUUID();

        User user = mock(User.class);

        when(user.getId()).thenReturn(userId);
        when(user.getFullName()).thenReturn("Test User");
        when(user.getEmail()).thenReturn("test@moneyos.dev");
        when(user.getCurrency()).thenReturn("INR");

        Page<User> userPage = new PageImpl<>(
                List.of(user),
                pageable,
                1
        );

        when(userRepository.findAllActiveUsers(pageable))
                .thenReturn(userPage);

        // Act
        Page<UserResponse> responsePage =
                userService.getAllUsers(pageable);

        // Assert
        assertNotNull(responsePage);
        assertEquals(1, responsePage.getTotalElements());
        assertEquals(1, responsePage.getContent().size());

        UserResponse response = responsePage.getContent().get(0);

        assertEquals(userId, response.getId());
        assertEquals("Test User", response.getFullName());
        assertEquals("test@moneyos.dev", response.getEmail());
        assertEquals("INR", response.getCurrency());

        verify(userRepository).findAllActiveUsers(pageable);
    }
}
