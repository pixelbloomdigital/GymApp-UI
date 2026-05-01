package com.pixelbloom.coreService.requestDto;

import lombok.Data;

@Data
public class LogHealthMetricsRequest {
    /** Weight in kg (optional) */
    private Double weight;
    /** Heart rate in bpm (optional) */
    private Integer heartRate;
    private String notes;
}
