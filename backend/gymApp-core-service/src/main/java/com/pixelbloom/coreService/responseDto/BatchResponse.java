package com.pixelbloom.coreService.responseDto;

import com.pixelbloom.coreService.enums.BatchType;
import lombok.Data;

@Data
public class BatchResponse {
    private Long id;
    private String name;
    private BatchType type;
    private String timeSlot;
    private Integer capacity;
    private Integer currentEnrollment;
    private Integer availableSlots;
    private Long trainerId;
    private Boolean isActive;
}
