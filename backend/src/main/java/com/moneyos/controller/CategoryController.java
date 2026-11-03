
package com.moneyos.controller;

import com.moneyos.dto.request.CategoryRequest;
import com.moneyos.dto.response.CategoryResponse;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.service.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication) {

        return categoryService.createCategory(
                getUserId(authentication), request);
    }

    @GetMapping
    public List<CategoryResponse> getMyCategories(
            @RequestParam(required = false) TransactionType type,
            Authentication authentication) {

        return categoryService.getMyCategories(
                getUserId(authentication), type);
    }

    private UUID getUserId(Authentication authentication) {
        if (authentication == null
                || authentication.getPrincipal() == null) {
            throw new org.springframework.security.authentication
                    .AuthenticationCredentialsNotFoundException(
                    "Authentication is required");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof User user) {
            return user.getId();
        }

        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "Cannot extract user UUID from authenticated principal",
                    exception);
        }
    }
}
