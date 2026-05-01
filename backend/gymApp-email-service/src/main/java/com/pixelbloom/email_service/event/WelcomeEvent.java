package com.pixelbloom.email_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WelcomeEvent {

    private Long memberId;
    private Long membershipId;
    private String memberName;
    private String memberEmail;
    private String memberPhone;
    private String planName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String batchName;
    private String timeSlot;
    private Double paidAmount;
    private String orderNumber;

    // Nullable optional fields
    private String dietPlanName;
    private LocalDate dietStartDate;
    private LocalDate dietEndDate;
    private String goalDetails;
}
