package com.pixelbloom.coreService.requestDto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AssignMembershipRequest {
    @NotNull
    private Long memberId;
    @NotNull
    private Long planId;
    @NotNull
    private Long batchId;
    private LocalDate startDate;      // defaults to today if null
    private Long assignedBy;          // admin's memberId
}
