package com.pixelbloom.coreService.responseDto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendanceJobResult {
    private Long sessionId;
    private Long batchId;
    private LocalDate date;
    private int totalMembers;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private int pendingReviewCount;
    private boolean timedOut;
}
