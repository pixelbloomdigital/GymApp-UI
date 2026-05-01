package com.pixelbloom.coreService.requestDto;

import com.pixelbloom.coreService.enums.BatchType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreateBatchRequest {
    @NotBlank
    private String name;
    @NotNull
    private BatchType type;
    @NotBlank
    private String timeSlot;
    @NotNull @Positive
    private Integer capacity;
    private Long trainerId;
    private Boolean isActive;
}
