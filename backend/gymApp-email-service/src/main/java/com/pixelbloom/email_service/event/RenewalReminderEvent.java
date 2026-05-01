package com.pixelbloom.email_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RenewalReminderEvent {

    private Long memberId;
    private Long membershipId;
    private String memberName;
    private String memberEmail;
    private String memberPhone;
    private String planName;
    private LocalDate endDate;
    private String batchName;
}
