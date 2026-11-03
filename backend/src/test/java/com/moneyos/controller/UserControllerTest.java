
package com.moneyos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyos.dto.request.UserRegistrationRequest;
import com.moneyos.dto.response.UserResponse;
import com.moneyos.service.TokenRevocationService;
import com.moneyos.service.UserService;
import com.moneyos.repository.UserRepository;
import com.moneyos.security.JwtService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private TokenRevocationService tokenRevocationService;

    @MockitoBean
    private UserRepository userRepository;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private UserService userService;

    @Test
    void registerUser_shouldReturn201_whenRequestIsValid() throws Exception {
        UserRegistrationRequest request = new UserRegistrationRequest();

        // Update these setters if your DTO uses different field names.
        request.setFullName("Test User");
        request.setEmail("test@moneyos.dev");
        request.setPassword("Password123");

        UserResponse response = UserResponse.builder()
                .id(UUID.randomUUID())
                .fullName("Test User")
                .email("test@moneyos.dev")
                .currency("INR")
                .build();

        when(userService.registerUser(any(UserRegistrationRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@moneyos.dev"));

        verify(userService).registerUser(any(UserRegistrationRequest.class));
    }

    @Test
    void getAllUsers_shouldReturn200_whenServiceReturnsUsers() throws Exception {
        UserResponse user = UserResponse.builder()
                .id(UUID.randomUUID())
                .fullName("Test User")
                .email("test@moneyos.dev")
                .currency("INR")
                .build();

        Page<UserResponse> page = new PageImpl<>(
                List.of(user),
                PageRequest.of(0, 10),
                1
        );

        when(userService.getAllUsers(any())).thenReturn(page);

        mockMvc.perform(get("/api/users")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].fullName").value("Test User"))
                .andExpect(jsonPath("$.content[0].email").value("test@moneyos.dev"));

        verify(userService).getAllUsers(any());
    }
}
