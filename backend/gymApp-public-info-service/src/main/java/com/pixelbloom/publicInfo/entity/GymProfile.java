package com.pixelbloom.publicInfo.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Singleton entity — only one row (id=1) represents the gym's public profile.
 */
@Entity
@Table(name = "gym_profile")
@Data
public class GymProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gymName;

    @Column(length = 1000)
    private String tagline;

    @Column(length = 2000)
    private String description;

    private String address;

    private String city;

    private String phone;

    private String email;

    private String websiteUrl;

    // Social media
    private String instagramUrl;
    private String facebookUrl;
    private String youtubeUrl;
    private String whatsappNumber;

    // Branding
    private String logoUrl;
    private String bannerImageUrl;

    // Operating hours (simple string e.g. "Mon-Sat: 6AM-10PM")
    private String operatingHours;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
