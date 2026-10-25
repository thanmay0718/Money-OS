package com.moneyos.repository;

import com.moneyos.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("""
       SELECT u FROM User u
       WHERE u.deletedAt IS NULL
       ORDER BY u.createdAt DESC
       """)
    Page<User> findAllActiveUsers(Pageable pageable);

}
