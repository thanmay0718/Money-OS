
package com.moneyos.service;

import com.moneyos.dto.request.CategoryRequest;
import com.moneyos.dto.response.CategoryResponse;
import com.moneyos.entity.TransactionType;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    CategoryResponse createCategory(
            UUID userId,
            CategoryRequest request
    );

    List<CategoryResponse> getMyCategories(
            UUID userId,
            TransactionType type
    );
}
