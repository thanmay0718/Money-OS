
package com.moneyos.security;

import com.moneyos.entity.User;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.TokenRevocationService;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenRevocationService tokenRevocationService;

    private JwtAuthenticationFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private MockFilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(
                jwtService,
                userRepository,
                tokenRevocationService
        );

        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = new MockFilterChain();

        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private User createUser(UUID userId) {
        User user = new User(
                "Test User",
                "test@moneyos.dev",
                "encoded-password"
        );

        ReflectionTestUtils.setField(user, "id", userId);

        return user;
    }

    private void stubTokenLookup(String token, UUID userId, User user) {
        when(jwtService.extractTokenId(token)).thenReturn("token-id");
        when(tokenRevocationService.isTokenRevoked("token-id"))
                .thenReturn(false);
        when(jwtService.extractUserId(token)).thenReturn(userId);
        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));
    }

    @Test
    void doFilter_shouldContinue_whenAuthorizationHeaderIsMissing()
            throws Exception {

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());

        verifyNoInteractions(jwtService);
        verifyNoInteractions(userRepository);
        verifyNoInteractions(tokenRevocationService);
    }

    @Test
    void doFilter_shouldContinue_whenAuthorizationHeaderIsNotBearer()
            throws Exception {

        request.addHeader("Authorization", "Basic abc123");

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());

        verifyNoInteractions(jwtService);
        verifyNoInteractions(userRepository);
        verifyNoInteractions(tokenRevocationService);
    }

    @Test
    void doFilter_shouldReturnUnauthorized_whenBearerTokenIsEmpty()
            throws Exception {

        request.addHeader("Authorization", "Bearer ");

        filter.doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
        assertNull(SecurityContextHolder.getContext().getAuthentication());

        verifyNoInteractions(jwtService);
        verifyNoInteractions(userRepository);
        verifyNoInteractions(tokenRevocationService);
    }

    @Test
    void doFilter_shouldAuthenticateUser_whenTokenIsValid()
            throws Exception {

        String token = "valid-token";
        UUID userId = UUID.randomUUID();
        User user = createUser(userId);

        stubTokenLookup(token, userId, user);
        when(jwtService.isTokenValid(token, user)).thenReturn(true);

        request.addHeader("Authorization", "Bearer " + token);

        filter.doFilter(request, response, filterChain);

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(authentication);
        assertSame(user, authentication.getPrincipal());
        assertTrue(authentication.isAuthenticated());
        assertTrue(authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));

        verify(jwtService).isTokenValid(token, user);
    }

    @Test
    void doFilter_shouldReturnUnauthorized_whenTokenIsRevoked()
            throws Exception {

        String token = "revoked-token";

        request.addHeader("Authorization", "Bearer " + token);

        when(jwtService.extractTokenId(token)).thenReturn("revoked-id");
        when(tokenRevocationService.isTokenRevoked("revoked-id"))
                .thenReturn(true);

        filter.doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
        assertNull(SecurityContextHolder.getContext().getAuthentication());

        verifyNoInteractions(userRepository);
        verify(jwtService, never()).extractUserId(token);
    }

    @Test
    void doFilter_shouldReturnUnauthorized_whenTokenParsingThrowsJwtException()
            throws Exception {

        String token = "malformed-token";

        request.addHeader("Authorization", "Bearer " + token);

        when(jwtService.extractTokenId(token))
                .thenThrow(new JwtException("Malformed token"));

        filter.doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
        assertNull(SecurityContextHolder.getContext().getAuthentication());

        verifyNoInteractions(userRepository);
    }

    @Test
    void doFilter_shouldNotAuthenticate_whenUserDoesNotExist()
            throws Exception {

        String token = "valid-format-token";
        UUID userId = UUID.randomUUID();

        request.addHeader("Authorization", "Bearer " + token);

        when(jwtService.extractTokenId(token)).thenReturn("token-id");
        when(tokenRevocationService.isTokenRevoked("token-id"))
                .thenReturn(false);
        when(jwtService.extractUserId(token)).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());

        verify(jwtService, never()).isTokenValid(
                eq(token), any(User.class)
        );
    }

    @Test
    void doFilter_shouldNotAuthenticate_whenUserIsSoftDeleted()
            throws Exception {

        String token = "deleted-user-token";
        UUID userId = UUID.randomUUID();
        User user = createUser(userId);
        user.setDeletedAt(Instant.now());

        request.addHeader("Authorization", "Bearer " + token);

        stubTokenLookup(token, userId, user);

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());

        verify(jwtService, never()).isTokenValid(
                eq(token), any(User.class)
        );
    }

    @Test
    void doFilter_shouldNotAuthenticate_whenTokenFailsUserValidation()
            throws Exception {

        String token = "invalid-for-user-token";
        UUID userId = UUID.randomUUID();
        User user = createUser(userId);

        stubTokenLookup(token, userId, user);
        when(jwtService.isTokenValid(token, user)).thenReturn(false);

        request.addHeader("Authorization", "Bearer " + token);

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(jwtService).isTokenValid(token, user);
    }
}
