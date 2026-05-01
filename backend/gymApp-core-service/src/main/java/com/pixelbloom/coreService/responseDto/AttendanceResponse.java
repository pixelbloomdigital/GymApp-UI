package com.pixelbloom.coreService.responseDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pixelbloom.coreService.enums.AttendanceStatus;

import lombok.Data;

@Data
public class AttendanceResponse {
    private Long attendanceId;
    private Long memberId;
    private Long batchId;
    private String batchName;
    private LocalDate date;
    private String timeSlot;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime checkInTime;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime checkOutTime;
    private AttendanceStatus status;
    private String markedBy;
    private Long markedById;
    private String notes;
    private LocalDateTime createdAt;

    // AI fields
    private Boolean aiGenerated;
    private AttendanceStatus aiSuggestedStatus;
    private Double confidenceScore;
    private String reviewStatus;
    private Long overriddenBy;
    private LocalDateTime overriddenAt;
}
