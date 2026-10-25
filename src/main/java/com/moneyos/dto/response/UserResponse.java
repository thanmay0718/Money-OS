
package com.moneyos.dto.response;

import com.moneyos.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class UserResponse {

    private UUID id;
    private String fullName;
    private String email;
    private String currency;
    private UserRole role;
    private Instant createdAt;
}
