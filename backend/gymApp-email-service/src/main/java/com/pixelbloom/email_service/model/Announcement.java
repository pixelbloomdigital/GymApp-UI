package com.pixelbloom.email_service.model;

import com.pixelbloom.email_service.enums.AnnouncementType;
import com.pixelbloom.email_service.enums.TargetAudience;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private AnnouncementType type;

    @Enumerated(EnumType.STRING)
    private TargetAudience targetAudience;

    private Long createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    public void prePersist() {
        if (isActive == null) {
            isActive = true;
        }
    }
}
