
package com.moneyos.repository;

import com.moneyos.entity.Category;
import com.moneyos.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository
        extends JpaRepository<Category, UUID> {

    List<Category> findAllByUser_IdAndActiveTrue(UUID userId);

    List<Category> findAllByUser_IdAndTypeAndActiveTrue(
            UUID userId,
            TransactionType type
    );

    Optional<Category> findByIdAndUser_IdAndTypeAndActiveTrue(
            UUID categoryId,
            UUID userId,
            TransactionType type
    );

    boolean existsByUser_IdAndNameIgnoreCaseAndType(
            UUID userId,
            String name,
            TransactionType type
    );
}
