package com.moneyos.security;

import com.moneyos.dto.response.AuthResponse;
import com.moneyos.service.OAuth2AuthenticationService;
import com.moneyos.service.OAuthExchangeCodeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final OAuth2AuthenticationService oauth2AuthenticationService;
    private final OAuthExchangeCodeService oauthExchangeCodeService;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${moneyos.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        try {
            if (!(authentication.getPrincipal() instanceof OAuth2User principal)) {
                throw new OAuth2AuthenticationException("OAuth2 principal is unavailable");
            }

            AuthResponse authResponse = oauth2AuthenticationService.authenticate(
                    authentication,
                    principal
            );

            String code = oauthExchangeCodeService.create(authResponse);
            httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

            String redirectTarget = sanitizeRedirectBase(frontendUrl) + "/oauth/callback?code="
                    + URLEncoder.encode(code, StandardCharsets.UTF_8);

            response.sendRedirect(redirectTarget);
        } catch (Exception ex) {
            log.warn("OAuth authentication success handling failed: {}", ex.getMessage());
            httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

            String message = ex.getMessage();
            if (message == null || message.isBlank()) {
                message = "OAuth authentication failed";
            }

            String redirectTarget = sanitizeRedirectBase(frontendUrl) + "/login?oauthError="
                    + URLEncoder.encode(message, StandardCharsets.UTF_8);

            response.sendRedirect(redirectTarget);
        }
    }

    private String sanitizeRedirectBase(String url) {
        try {
            URI uri = URI.create(url);
            String host = uri.getHost();
            if (host != null && (host.equals("localhost") || host.equals("127.0.0.1") || host.endsWith(".moneyos.com"))) {
                return url.replaceAll("/+$", "");
            }
        } catch (Exception ignored) {
        }
        return "http://localhost:5173";
    }
}
