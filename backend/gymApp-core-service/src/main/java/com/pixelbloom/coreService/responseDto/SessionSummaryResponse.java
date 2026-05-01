package com.pixelbloom.coreService.responseDto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SessionSummaryResponse {
    private Long sessionId;
    private Long batchId;
    private String batchName;
    private LocalDate date;
    private int totalEnrolled;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private int pendingReviewCount;
    private boolean aiAttendanceGenerated;
}
