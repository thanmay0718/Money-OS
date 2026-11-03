
package com.moneyos.security;

import com.moneyos.entity.User;
import com.moneyos.enums.UserRole;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String TEST_SECRET =
            "VGhpc0lzQU5vdFJlYWxTZWN1cmVLZXlGb3JNb25leU9TVGVzdGluZzEyMzQ1Njc4OTA=";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET, 900_000L);
    }

    private User createUser(UUID id, String email) {
        User user = new User("Test User", email, "encoded-password");

        ReflectionTestUtils.setField(user, "id", id);
        ReflectionTestUtils.setField(user, "role", UserRole.USER);

        return user;
    }

    @Test
    void generateToken_shouldCreateNonBlankToken() {
        User user = createUser(
                UUID.randomUUID(),
                "test@moneyos.dev"
        );

        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void extractUserId_shouldReturnCorrectUserId() {
        UUID userId = UUID.randomUUID();
        User user = createUser(userId, "test@moneyos.dev");

        String token = jwtService.generateToken(user);

        assertEquals(userId, jwtService.extractUserId(token));
    }

    @Test
    void extractTokenId_shouldReturnNonBlankUniqueId() {
        User user = createUser(
                UUID.randomUUID(),
                "test@moneyos.dev"
        );

        String token1 = jwtService.generateToken(user);
        String token2 = jwtService.generateToken(user);

        String tokenId1 = jwtService.extractTokenId(token1);
        String tokenId2 = jwtService.extractTokenId(token2);

        assertNotNull(tokenId1);
        assertFalse(tokenId1.isBlank());
        assertNotEquals(tokenId1, tokenId2);
    }

    @Test
    void extractExpiration_shouldReturnFutureInstant() {
        User user = createUser(
                UUID.randomUUID(),
                "test@moneyos.dev"
        );

        String token = jwtService.generateToken(user);

        Instant expiration = jwtService.extractExpiration(token);

        assertNotNull(expiration);
        assertTrue(expiration.isAfter(Instant.now()));
    }

    @Test
    void isTokenValid_shouldReturnTrueForCorrectUser() {
        User user = createUser(
                UUID.randomUUID(),
                "test@moneyos.dev"
        );

        String token = jwtService.generateToken(user);

        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void isTokenValid_shouldReturnFalseForDifferentUser() {
        User originalUser = createUser(
                UUID.randomUUID(),
                "test@moneyos.dev"
        );

        User differentUser = createUser(
                UUID.randomUUID(),
                "other@moneyos.dev"
        );

        String token = jwtService.generateToken(originalUser);

        assertFalse(jwtService.isTokenValid(token, differentUser));
    }

    @Test
    void extractUserId_shouldRejectTamperedToken() {
        User user = createUser(
                UUID.randomUUID(),
                "test@moneyos.dev"
        );

        String token = jwtService.generateToken(user);

        // Change the final token character to tamper with the signature.
        char lastChar = token.charAt(token.length() - 1);
        char replacement = lastChar == 'a' ? 'b' : 'a';
        String tamperedToken =
                token.substring(0, token.length() - 1) + replacement;

        assertThrows(
                JwtException.class,
                () -> jwtService.extractUserId(tamperedToken)
        );
    }

    @Test
    void extractUserId_shouldRejectMalformedToken() {
        assertThrows(
                JwtException.class,
                () -> jwtService.extractUserId("not-a-valid-jwt")
        );
    }

    @Test
    void getExpirationSeconds_shouldReturnConfiguredSeconds() {
        assertEquals(900L, jwtService.getExpirationSeconds());
    }
}
