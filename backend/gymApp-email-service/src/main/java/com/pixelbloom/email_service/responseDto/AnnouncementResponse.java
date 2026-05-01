package com.pixelbloom.email_service.responseDto;

import com.pixelbloom.email_service.enums.AnnouncementType;
import com.pixelbloom.email_service.enums.TargetAudience;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementResponse {

    private Long id;
    private String title;
    private String message;
    private AnnouncementType type;
    private TargetAudience targetAudience;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isActive;
}
