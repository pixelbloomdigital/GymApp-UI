package com.pixelbloom.coreService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/actuator/**",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/error",
                    "/api/memberships/payments/callback",  // internal — called by payment-service
                    "/api/members/internal/**"             // internal — called by email-service
                ).permitAll()
                // Admin-only management endpoints
                .requestMatchers("/api/staff/**").hasRole("ADMIN")
                .requestMatchers("/api/equipment/**").hasRole("ADMIN")
                .requestMatchers("/api/expenses/**").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/summary").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/revenue/**").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/income/**").hasRole("ADMIN")
                .requestMatchers("/api/memberships/plans").hasAnyRole("ADMIN", "MEMBER", "TRAINER", "VISITOR")
                .requestMatchers("/api/memberships/plans/**").hasAnyRole("ADMIN", "MEMBER", "TRAINER", "VISITOR")
                .requestMatchers("/api/diet-plans/**").hasAnyRole("ADMIN", "MEMBER", "TRAINER")
                .requestMatchers("/api/batches").hasAnyRole("ADMIN", "MEMBER", "TRAINER", "VISITOR")
                .requestMatchers("/api/batches/**").hasAnyRole("ADMIN", "MEMBER", "TRAINER", "VISITOR")
                // Trainer endpoints
                .requestMatchers("/api/trainer-attendance/**").hasAnyRole("ADMIN", "TRAINER")
                .requestMatchers("/api/trainer-payroll/**").hasAnyRole("ADMIN", "TRAINER")
                // Member self-service
                .requestMatchers("/api/attendance/check-in").hasAnyRole("MEMBER", "ADMIN")
                .requestMatchers("/api/attendance/check-out").hasAnyRole("MEMBER", "ADMIN")
                .requestMatchers("/api/dashboard/member/**").hasAnyRole("MEMBER", "ADMIN")
                // All other requests need authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
