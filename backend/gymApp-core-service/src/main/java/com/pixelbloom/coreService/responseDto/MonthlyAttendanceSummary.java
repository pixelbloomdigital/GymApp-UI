package com.pixelbloom.coreService.responseDto;

import com.pixelbloom.coreService.enums.AttendanceStatus;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class MonthlyAttendanceSummary {
    private Long memberId;
    private String yearMonth;          // e.g. "2026-03"
    private int totalDays;             // days in month
    private int presentDays;
    private int absentDays;
    private int lateDays;
    private int halfDays;
    private double attendancePercent;
    private List<AttendanceResponse> records;
}
