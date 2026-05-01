package com.pixelbloom.authLogin.entity;

import com.pixelbloom.authLogin.enums.AuthProviderType;
import com.pixelbloom.authLogin.enums.MemberStatus;
import com.pixelbloom.authLogin.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    private String name;
    @Column(unique = true, nullable = false)
    private String email;
    private String phone;

    private String password;
    public String gymCenter;

    @CreationTimestamp
    public LocalDateTime joinedAt;

    @Enumerated(EnumType.STRING)
    private Role role;

    /**
     * INACTIVE on creation.
     * gymApp-core-service calls PATCH /api/auth/members/{memberId}/status
     * to set ACTIVE once a valid membership payment is confirmed.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus memberStatus = MemberStatus.INACTIVE;

    /**
     * OAuth2 provider subject ID (e.g. Google's "sub" claim).
     * Null for EMAIL registrations.
     */
    @Column(name = "provider_id")
    private String providerId;

    /**
     * Which OAuth2 provider was used, or EMAIL for manual registration.
     * Maps to column: provider_type
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false)
    private AuthProviderType providerType = AuthProviderType.EMAIL;
}
