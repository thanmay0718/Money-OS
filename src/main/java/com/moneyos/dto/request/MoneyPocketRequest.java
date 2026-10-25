
package com.moneyos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MoneyPocketRequest(

        @NotBlank(message = "Pocket name is required")
        @Size(max = 80, message = "Pocket name cannot exceed 80 characters")
        String name

) {}
