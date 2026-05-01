package com.pixelbloom.authLogin.responsedto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VisitorNotificationResponse {
    private Long id;
    private String message;
    private String type;
    private LocalDateTime createdAt;
    private boolean readFlag;
}
