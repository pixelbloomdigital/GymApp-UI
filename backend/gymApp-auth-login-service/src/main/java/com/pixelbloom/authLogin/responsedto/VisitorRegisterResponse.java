package com.pixelbloom.authLogin.responsedto;

import lombok.*;

import java.time.LocalDate;
import com.pixelbloom.authLogin.entity.BatchType;
import java.util.List;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VisitorRegisterResponse {
    private Long visitorId;
    private String status;
    private String name;
    private String email;
    private String phone;
    private String gymCenter;
    private List<BatchType> preferredBatches;
    private Long interestedMembershipPlanId;
    private LocalDate demoDatePreference;
    private String demoTimeSlotPreference;
}
