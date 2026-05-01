package com.pixelbloom.publicInfo.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Swagger
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // All public GET endpoints — no auth required
                .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
                // Member/visitor booking flows
                .requestMatchers(HttpMethod.POST, "/api/public/events/*/register").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/public/costumes/book", "/api/public/costumes/book/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/public/costumes/payment-callback").permitAll()
                // Admin-only write operations
                .requestMatchers(HttpMethod.POST,   "/api/public/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/public/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/public/**").hasRole("ADMIN")
                // Costume booking — authenticated users (MEMBER, VISITOR)
                .requestMatchers("/api/public/costumes/book/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
