package com.moneyos.repository;

import com.moneyos.entity.OAuthAccount;
import com.moneyos.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OAuthAccountRepository extends JpaRepository<OAuthAccount, UUID> {

    Optional<OAuthAccount> findByProviderAndProviderAccountId(
            String provider,
            String providerAccountId
    );

    boolean existsByProviderAndProviderAccountId(
            String provider,
            String providerAccountId
    );

    boolean existsByUserAndProvider(User user, String provider);
}
