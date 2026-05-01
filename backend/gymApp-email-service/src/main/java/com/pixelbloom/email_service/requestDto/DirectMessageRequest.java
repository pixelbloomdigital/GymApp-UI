package com.pixelbloom.email_service.requestDto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DirectMessageRequest {

    @NotBlank
    private String subject;   // used as email subject / WhatsApp header

    @NotBlank
    private String message;
}
