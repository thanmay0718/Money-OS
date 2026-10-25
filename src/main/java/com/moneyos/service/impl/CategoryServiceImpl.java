
package com.moneyos.service.impl;

import com.moneyos.dto.request.CategoryRequest;
import com.moneyos.dto.response.CategoryResponse;
import com.moneyos.entity.Category;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.CategoryRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.CategoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(
            UUID userId,
            CategoryRequest request) {

        User user = userRepository.findById(userId)
                .filter(existing -> existing.getDeletedAt() == null)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        String name = request.name().trim();
        TransactionType type = request.type();

        if (name.isBlank()) {
            throw badRequest("Category name cannot be blank");
        }

        if (type == TransactionType.TRANSFER) {
            throw badRequest(
                    "Categories are only allowed for income and expenses");
        }

        if (categoryRepository.existsByUser_IdAndNameIgnoreCaseAndType(
                userId, name, type)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category already exists for this type");
        }

        Category category = new Category(user, name, type);

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getMyCategories(
            UUID userId,
            TransactionType type) {

        userRepository.findById(userId)
                .filter(existing -> existing.getDeletedAt() == null)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (type == TransactionType.TRANSFER) {
            throw badRequest(
                    "Transfer categories are not supported");
        }

        List<Category> categories = type == null
                ? categoryRepository.findAllByUser_IdAndActiveTrue(userId)
                : categoryRepository.findAllByUser_IdAndTypeAndActiveTrue(
                userId, type);

        return categories.stream()
                .map(this::toResponse)
                .toList();
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST, message);
    }
}
