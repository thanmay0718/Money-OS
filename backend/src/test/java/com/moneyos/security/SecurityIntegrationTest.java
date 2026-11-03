package com.moneyos.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void oauth2AuthorizationGoogle_shouldRedirectToGoogle_withoutJwt() throws Exception {
        mockMvc.perform(get("/oauth2/authorization/google"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("accounts.google.com")));
    }

    @Test
    void oauth2AuthorizationGithub_shouldRedirectToGithub_withoutJwt() throws Exception {
        mockMvc.perform(get("/oauth2/authorization/github"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("github.com/login/oauth/authorize")));
    }

    @Test
    void exchangeEndpoint_shouldBeAccessibleWithoutJwt() throws Exception {
        mockMvc.perform(post("/api/auth/oauth/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"non-existent-code\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void protectedMeEndpoint_shouldReturn401_whenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }
}
