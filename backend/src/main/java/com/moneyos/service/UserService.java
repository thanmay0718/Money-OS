package com.moneyos.service;

import com.moneyos.dto.request.UserRegistrationRequest;
import com.moneyos.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse registerUser(UserRegistrationRequest request);
    Page<UserResponse> getAllUsers(Pageable pageable);
}
