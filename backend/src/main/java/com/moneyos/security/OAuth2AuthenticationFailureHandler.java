package com.moneyos.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationFailureHandler.class);

    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${moneyos.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        log.warn("OAuth2 authentication failure: {}", exception.getMessage());
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

        String errorMessage = exception.getMessage();
        if (errorMessage == null || errorMessage.isBlank()) {
            errorMessage = "OAuth authentication failed";
        }

        String redirectTarget = sanitizeRedirectBase(frontendUrl) + "/login?oauthError="
                + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

        response.sendRedirect(redirectTarget);
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
