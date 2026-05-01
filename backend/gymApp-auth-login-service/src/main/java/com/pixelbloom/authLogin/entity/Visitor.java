package com.pixelbloom.authLogin.entity;

import com.pixelbloom.authLogin.enums.AuthProviderType;
import com.pixelbloom.authLogin.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor @NoArgsConstructor
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long visitorId;

    private String name;
    @Column(unique = true, nullable = false)
    private String email;
    private String phone;
    private String gymCenter;
    private String city;
    private String state;

    LocalDate visitDate;

    @Column(name = "visited_at")
    public LocalDateTime visitedAt;

    @PrePersist
    void prePersist() {
        if (visitDate == null) visitDate = LocalDate.now();
    }

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String preferredBatchesJson;

    // Requirement 4.5 — new fields
    private Long interestedMembershipPlanId;
    private String inquirySource;
    private LocalDate demoDatePreference;
    private String demoTimeSlotPreference;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String eventInterestJson;   // stored as JSON array of strings

    private Boolean costumeInterest;

    @Column(name = "provider_id")
    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false)
    private AuthProviderType providerType = AuthProviderType.EMAIL;

    private String profilePictureUrl;

    @Enumerated(EnumType.STRING)
    private Role role = Role.VISITOR;

    private String password;
}
