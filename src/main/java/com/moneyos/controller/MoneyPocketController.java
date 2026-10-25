
package com.moneyos.controller;

import com.moneyos.dto.request.MoneyPocketRequest;
import com.moneyos.dto.response.MoneyPocketResponse;
import com.moneyos.service.MoneyPocketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Sort;
import com.moneyos.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pockets")
@RequiredArgsConstructor
public class MoneyPocketController {

    private final MoneyPocketService moneyPocketService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MoneyPocketResponse createPocket(
            @Valid @RequestBody MoneyPocketRequest request,
            Authentication authentication) {

        return moneyPocketService.createPocket(
                getUserId(authentication), request);
    }

    @GetMapping
    public List<MoneyPocketResponse> getMyPockets(
            Authentication authentication) {

        return moneyPocketService.getMyPockets(
                getUserId(authentication));
    }


    private UUID getUserId(Authentication authentication) {

        if (authentication == null
                || authentication.getPrincipal() == null) {
            throw new org.springframework.security.authentication
                    .AuthenticationCredentialsNotFoundException(
                    "Authentication is required");
        }

        Object principal = authentication.getPrincipal();

        // Your JWT filter appears to store the User entity as principal.
        if (principal instanceof User user) {
            return user.getId();
        }

        // Fallback for configurations that store the UUID as the name.
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "Cannot extract user UUID from authenticated principal",
                    exception);
        }
    }



}
