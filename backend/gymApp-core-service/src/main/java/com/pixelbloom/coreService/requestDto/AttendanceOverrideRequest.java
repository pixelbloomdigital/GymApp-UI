package com.pixelbloom.coreService.requestDto;

import com.pixelbloom.coreService.enums.AttendanceStatus;
import lombok.Data;

@Data
public class AttendanceOverrideRequest {
    private AttendanceStatus status;
    private String notes;
}
