package com.pixelbloom.coreService.requestDto;

import com.pixelbloom.coreService.enums.AttendanceStatus;
import lombok.Data;

import java.time.LocalTime;

@Data
public class UpdateAttendanceRequest {
    private AttendanceStatus status;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String notes;
}
