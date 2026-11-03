
package com.moneyos.repository;

import com.moneyos.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUserByEmail() {
        User user = new User(
                "Test User",
                "test@moneyos.dev",
                "test-hash-not-a-real-password"
        );

        userRepository.saveAndFlush(user);

        var result = userRepository.findByEmail(
                "test@moneyos.dev"
        );

        assertThat(result).isPresent();
        assertThat(result.get().getFullName())
                .isEqualTo("Test User");
        assertThat(result.get().getId()).isNotNull();
        assertThat(result.get().getCreatedAt()).isNotNull();
        assertThat(result.get().getUpdatedAt()).isNotNull();
    }
}
