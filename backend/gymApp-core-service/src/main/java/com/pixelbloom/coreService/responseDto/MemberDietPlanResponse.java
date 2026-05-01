package com.pixelbloom.coreService.responseDto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MemberDietPlanResponse {
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private Boolean purchased;
    private LocalDateTime purchasedAt;
    private Long assignedByTrainerId;
    private String assignedPlanTitle;
    private String assignedPlanDetails;
    private LocalDateTime assignedAt;
}
