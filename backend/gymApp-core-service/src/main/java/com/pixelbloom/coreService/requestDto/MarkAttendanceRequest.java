package com.pixelbloom.coreService.requestDto;

import com.pixelbloom.coreService.enums.AttendanceStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MarkAttendanceRequest {
    private Long memberId;
    private Long batchId;
    private LocalDate date;           // defaults to today if null
    private String timeSlot;
    private AttendanceStatus status;  // defaults to PRESENT if null
    private String notes;
    private Long markedById;          // admin/trainer memberId
}
