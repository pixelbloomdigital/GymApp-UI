package com.pixelbloom.email_service.event;

import com.pixelbloom.email_service.enums.AnnouncementType;
import com.pixelbloom.email_service.enums.TargetAudience;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementEvent {

    private Long id;
    private String title;
    private String message;
    private AnnouncementType type;
    private TargetAudience targetAudience;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
