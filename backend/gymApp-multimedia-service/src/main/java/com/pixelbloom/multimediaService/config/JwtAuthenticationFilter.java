package com.pixelbloom.multimediaService.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secretKey}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email    = claims.getSubject();
            String roleStr  = claims.get("role", String.class);
            Object memberIdRaw = claims.get("memberId");
            Long   memberId = memberIdRaw == null ? null
                    : (memberIdRaw instanceof Long ? (Long) memberIdRaw
                    : ((Number) memberIdRaw).longValue());

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String normalizedRole = roleStr == null
                    ? null
                    : (roleStr.startsWith("ROLE_") ? roleStr.toUpperCase() : ("ROLE_" + roleStr).toUpperCase());
                var authorities = normalizedRole == null
                    ? Collections.<SimpleGrantedAuthority>emptyList()
                    : List.of(new SimpleGrantedAuthority(normalizedRole));

                var authToken = new UsernamePasswordAuthenticationToken(email, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // Store claims as request attributes for controllers
                request.setAttribute("role", roleStr);
                request.setAttribute("memberId", memberId);
                // callerBatchId is resolved lazily by AccessControlService via Feign when needed
            }
        } catch (JwtException | IllegalArgumentException e) {
            // Invalid / expired token — proceed unauthenticated
        }

        filterChain.doFilter(request, response);
    }
}
