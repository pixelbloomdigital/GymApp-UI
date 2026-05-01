package com.pixelbloom.coreService.requestDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DietPlanAssignmentRequest {

    @NotNull
    private Long trainerId;

    @NotNull
    private Long memberId;

    @NotBlank
    private String planTitle;

    @NotBlank
    private String planDetails;
}
