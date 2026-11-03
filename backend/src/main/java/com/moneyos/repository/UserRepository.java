package com.moneyos.repository;

import com.moneyos.entity.User;
import com.moneyos.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByDeletedAtIsNull(Pageable pageable);

    long countByDeletedAtIsNull();

    long countByDeletedAtIsNotNull();

    Page<User> findAllByRole(UserRole role, Pageable pageable);

    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName,
            String email,
            Pageable pageable
    );

    Page<User> findByRoleAndFullNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
            UserRole role1,
            String fullName,
            UserRole role2,
            String email,
            Pageable pageable
    );

    List<User> findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(Instant since);


    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    Page<User> findAllActiveUsers(Pageable pageable);
}
