package com.moneyos.repository;

import com.moneyos.entity.Category;
import com.moneyos.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("SELECT c FROM Category c WHERE c.user.id = :userId AND c.active = true")
    List<Category> findAllByUser_IdAndActiveTrue(@Param("userId") UUID userId);

    @Query("SELECT c FROM Category c WHERE c.user.id = :userId AND c.type = :type AND c.active = true")
    List<Category> findAllByUser_IdAndTypeAndActiveTrue(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type
    );

    @Query("SELECT c FROM Category c WHERE c.id = :categoryId AND c.user.id = :userId AND c.type = :type AND c.active = true")
    Optional<Category> findByIdAndUser_IdAndTypeAndActiveTrue(
            @Param("categoryId") UUID categoryId,
            @Param("userId") UUID userId,
            @Param("type") TransactionType type
    );

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.user.id = :userId AND LOWER(c.name) = LOWER(:name) AND c.type = :type")
    boolean existsByUser_IdAndNameIgnoreCaseAndType(
            @Param("userId") UUID userId,
            @Param("name") String name,
            @Param("type") TransactionType type
    );

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.user ORDER BY c.createdAt DESC")
    List<Category> findAllWithUser();
}
