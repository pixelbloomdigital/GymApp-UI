package com.pixelbloom.coreService.requestDto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RenewMembershipRequest {
    @NotNull
    private Long planId;
    @NotNull
    private Long batchId;
}
