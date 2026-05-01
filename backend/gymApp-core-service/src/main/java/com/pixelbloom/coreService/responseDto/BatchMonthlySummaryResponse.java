package com.pixelbloom.coreService.responseDto;

import lombok.Data;

@Data
public class BatchMonthlySummaryResponse {
    private Long batchId;
    private String batchName;
    private String yearMonth;
    private double averageAttendanceRate;
    private double aiAccuracyRate;
    private int totalSessions;
    private int totalAiGeneratedRecords;
    private int totalOverriddenRecords;
}
