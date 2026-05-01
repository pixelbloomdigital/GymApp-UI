package com.pixelbloom.email_service.requestDto;

import java.time.LocalDateTime;

import com.pixelbloom.email_service.enums.AnnouncementType;
import com.pixelbloom.email_service.enums.TargetAudience;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    @NotNull
    private AnnouncementType type;

    @NotNull
    private TargetAudience targetAudience;

    private Long createdBy;

    @Future
    private LocalDateTime expiresAt;
}
