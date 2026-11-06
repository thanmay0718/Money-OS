package com.moneyos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiChatRequest(
        @NotBlank(message = "Message cannot be blank")
        @Size(max = 500, message = "Message cannot exceed 500 characters")
        String message
) {}
