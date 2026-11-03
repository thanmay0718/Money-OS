package com.moneyos.service;

import com.moneyos.dto.response.AuthResponse;
import com.moneyos.entity.OAuthAccount;
import com.moneyos.entity.User;
import com.moneyos.enums.UserRole;
import com.moneyos.repository.OAuthAccountRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OAuth2AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OAuthAccountRepository oauthAccountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private OAuth2User principal;

    @InjectMocks
    private OAuth2AuthenticationService service;

    private OAuth2AuthenticationToken token;

    @BeforeEach
    void setUp() {
        token = new OAuth2AuthenticationToken(principal, null, "google");
    }

    @Test
    void authenticate_shouldRegisterNewUser_whenFirstTimeGoogleLogin() {
        when(principal.getAttribute("sub")).thenReturn("google-sub-12345");
        when(principal.getAttribute("email")).thenReturn("user@gmail.com");
        when(principal.getAttribute("name")).thenReturn("Google User");

        when(oauthAccountRepository.findByProviderAndProviderAccountId("google", "google-sub-12345"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("user@gmail.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-pwd");

        User savedUser = new User("Google User", "user@gmail.com", "hashed-pwd");
        savedUser.setRole(UserRole.USER);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(savedUser)).thenReturn("generated-jwt");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        AuthResponse response = service.authenticate(token, principal);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("generated-jwt");
        assertThat(response.getUser().getEmail()).isEqualTo("user@gmail.com");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.USER);

        verify(oauthAccountRepository).save(any(OAuthAccount.class));
        verify(auditLogService).log(eq("OAUTH_USER_REGISTERED"), eq("user@gmail.com"), eq("user@gmail.com"), anyString());
    }

    @Test
    void authenticate_shouldRegisterNewUser_whenFirstTimeGithubLogin() {
        OAuth2AuthenticationToken githubToken = new OAuth2AuthenticationToken(principal, null, "github");
        when(principal.getAttribute("id")).thenReturn(987654321);
        when(principal.getAttribute("email")).thenReturn("octocat@github.dev");
        when(principal.getAttribute("login")).thenReturn("octocat");

        when(oauthAccountRepository.findByProviderAndProviderAccountId("github", "987654321"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("octocat@github.dev"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-pwd");

        User savedUser = new User("octocat", "octocat@github.dev", "hashed-pwd");
        savedUser.setRole(UserRole.USER);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(savedUser)).thenReturn("github-jwt");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        AuthResponse response = service.authenticate(githubToken, principal);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("github-jwt");
        assertThat(response.getUser().getEmail()).isEqualTo("octocat@github.dev");
        assertThat(response.getUser().getFullName()).isEqualTo("octocat");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.USER);

        verify(oauthAccountRepository).save(any(OAuthAccount.class));
        verify(auditLogService).log(eq("OAUTH_USER_REGISTERED"), eq("octocat@github.dev"), eq("octocat@github.dev"), anyString());
    }

    @Test
    void authenticate_shouldLoginExistingUser_withoutCreatingDuplicateOrOverwritingAdminRole() {
        when(principal.getAttribute("sub")).thenReturn("google-sub-12345");

        User existingAdmin = new User("Admin User", "admin@moneyos.dev", "pwd");
        existingAdmin.setRole(UserRole.ADMIN);
        OAuthAccount existingAccount = new OAuthAccount(existingAdmin, "google", "google-sub-12345");

        when(oauthAccountRepository.findByProviderAndProviderAccountId("google", "google-sub-12345"))
                .thenReturn(Optional.of(existingAccount));
        when(jwtService.generateToken(existingAdmin)).thenReturn("admin-jwt");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        AuthResponse response = service.authenticate(token, principal);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("admin-jwt");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.ADMIN);

        verify(userRepository, never()).save(any());
        verify(auditLogService).log(eq("OAUTH_LOGIN"), eq("admin@moneyos.dev"), eq("admin@moneyos.dev"), anyString());
    }

    @Test
    void authenticate_shouldReject_whenAccountIsDeactivated() {
        when(principal.getAttribute("sub")).thenReturn("google-sub-12345");

        User deletedUser = new User("Deleted User", "deleted@moneyos.dev", "pwd");
        deletedUser.setDeletedAt(Instant.now());
        OAuthAccount existingAccount = new OAuthAccount(deletedUser, "google", "google-sub-12345");

        when(oauthAccountRepository.findByProviderAndProviderAccountId("google", "google-sub-12345"))
                .thenReturn(Optional.of(existingAccount));

        assertThatThrownBy(() -> service.authenticate(token, principal))
                .isInstanceOf(OAuth2AuthenticationException.class)
                .hasMessageContaining("deactivated");
    }

    @Test
    void authenticate_shouldReject_whenEmailCollisionWithExistingLocalAccount() {
        when(principal.getAttribute("sub")).thenReturn("google-sub-99999");
        when(principal.getAttribute("email")).thenReturn("existing@moneyos.dev");

        when(oauthAccountRepository.findByProviderAndProviderAccountId("google", "google-sub-99999"))
                .thenReturn(Optional.empty());

        User localUser = new User("Local User", "existing@moneyos.dev", "pwd");
        when(userRepository.findByEmail("existing@moneyos.dev"))
                .thenReturn(Optional.of(localUser));

        assertThatThrownBy(() -> service.authenticate(token, principal))
                .isInstanceOf(OAuth2AuthenticationException.class)
                .hasMessageContaining("Account linking is required");
    }
}
