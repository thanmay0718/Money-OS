package com.moneyos.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final RestClient restClient;

    public CustomOAuth2UserService() {
        this.restClient = RestClient.create();
    }

    public CustomOAuth2UserService(RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        if ("github".equalsIgnoreCase(registrationId)) {
            return enrichGitHubUser(userRequest, oauth2User);
        }

        return oauth2User;
    }

    private OAuth2User enrichGitHubUser(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        Object emailObj = oauth2User.getAttribute("email");
        String email = emailObj != null ? emailObj.toString().trim() : null;

        if (email == null || email.isBlank()) {
            email = fetchGitHubPrimaryEmail(userRequest.getAccessToken().getTokenValue());
        }

        if (email == null || email.isBlank()) {
            Object id = oauth2User.getAttribute("id");
            Object login = oauth2User.getAttribute("login");
            if (id != null && login != null) {
                email = id + "+" + login + "@users.noreply.github.com";
                log.info("Using fallback GitHub noreply email: {}", email);
            }
        }

        Map<String, Object> attributes = new HashMap<>(oauth2User.getAttributes());
        if (email != null && !email.isBlank()) {
            attributes.put("email", email);
        }

        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();

        if (userNameAttributeName == null || userNameAttributeName.isBlank()) {
            userNameAttributeName = "id";
        }

        return new DefaultOAuth2User(oauth2User.getAuthorities(), attributes, userNameAttributeName);
    }

    private String fetchGitHubPrimaryEmail(String accessToken) {
        try {
            List<Map<String, Object>> emailEntries = restClient.get()
                    .uri("https://api.github.com/user/emails")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            if (emailEntries != null && !emailEntries.isEmpty()) {
                for (Map<String, Object> entry : emailEntries) {
                    Boolean primary = (Boolean) entry.get("primary");
                    Boolean verified = (Boolean) entry.get("verified");
                    String email = (String) entry.get("email");
                    if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified) && email != null && !email.isBlank()) {
                        return email.trim();
                    }
                }
                for (Map<String, Object> entry : emailEntries) {
                    Boolean verified = (Boolean) entry.get("verified");
                    String email = (String) entry.get("email");
                    if (Boolean.TRUE.equals(verified) && email != null && !email.isBlank()) {
                        return email.trim();
                    }
                }
                for (Map<String, Object> entry : emailEntries) {
                    String email = (String) entry.get("email");
                    if (email != null && !email.isBlank()) {
                        return email.trim();
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch emails from GitHub API: {}", ex.getMessage());
        }
        return null;
    }
}
