
package com.moneyos.security;

import com.moneyos.entity.User;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.TokenRevocationService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final TokenRevocationService tokenRevocationService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No Bearer token: continue without authentication.
        // Spring Security will protect endpoints that require authentication.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isEmpty()) {
            SecurityContextHolder.clearContext();
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid access token"
            );
            return;
        }

        try {
            // Validate and extract the JWT's unique ID.
            String tokenId = jwtService.extractTokenId(token);

            // Reject tokens that have already been revoked.
            if (tokenRevocationService.isTokenRevoked(tokenId)) {
                SecurityContextHolder.clearContext();
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Access token has been revoked"
                );
                return;
            }

            // Extract the user ID from the JWT subject.
            UUID userId = jwtService.extractUserId(token);

            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                User user = userRepository.findById(userId)
                        .filter(existingUser ->
                                existingUser.getDeletedAt() == null)
                        .orElse(null);

                // Authenticate only an existing user with a valid token.
                if (user != null && jwtService.isTokenValid(token, user)) {

                    var authorities = List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_" + user.getRole().name()
                            )
                    );

                    var authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    authorities
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (JwtException | IllegalArgumentException exception) {
            // Invalid, malformed, or expired JWT.
            SecurityContextHolder.clearContext();
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid or expired access token"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }
}
