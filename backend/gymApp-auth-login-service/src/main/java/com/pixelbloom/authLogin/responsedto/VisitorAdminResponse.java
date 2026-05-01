package com.pixelbloom.authLogin.responsedto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.pixelbloom.authLogin.entity.BatchType;
import java.util.List;

@Data
@Builder
public class VisitorAdminResponse {
    private Long visitorId;
    private String name;
    private String email;
    private String phone;
    private String gymCenter;
    private String role;
    private String providerType;
    private String inquirySource;
    private LocalDate visitDate;
    private LocalDateTime visitedAt;
    private List<BatchType> preferredBatches;
    private LocalDate demoDatePreference;
    private String demoTimeSlotPreference;
    private String profilePictureUrl;
}
