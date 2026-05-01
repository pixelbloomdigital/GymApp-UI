package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.requestDto.AttendanceOverrideRequest;
import com.pixelbloom.coreService.requestDto.CheckInRequest;
import com.pixelbloom.coreService.requestDto.MarkAttendanceRequest;
import com.pixelbloom.coreService.requestDto.UpdateAttendanceRequest;
import com.pixelbloom.coreService.responseDto.AttendanceResponse;
import com.pixelbloom.coreService.responseDto.BatchMonthlySummaryResponse;
import com.pixelbloom.coreService.responseDto.MonthlyAttendanceSummary;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

public interface AttendanceService {

    // Admin / Trainer mark attendance
    AttendanceResponse markAttendance(MarkAttendanceRequest request);

    // Member self check-in / check-out
    AttendanceResponse checkIn(CheckInRequest request);
    AttendanceResponse checkOut(Long memberId, Long batchId);

    // Queries
    List<AttendanceResponse> getTodayAttendance();
    List<AttendanceResponse> getAttendanceByDate(LocalDate date);
    List<AttendanceResponse> getAttendanceByMember(Long memberId);
    AttendanceResponse getAttendanceByMemberAndDate(Long memberId, LocalDate date, Long batchId);
    List<AttendanceResponse> getAttendanceByBatchAndDate(Long batchId, LocalDate date);
    MonthlyAttendanceSummary getMonthlyAttendance(Long memberId, YearMonth yearMonth);

    // Admin update / delete
    AttendanceResponse updateAttendance(Long attendanceId, UpdateAttendanceRequest request);
    void deleteAttendance(Long attendanceId);

    // AI-aware operations
    AttendanceResponse overrideAttendance(Long attendanceId, AttendanceOverrideRequest request, Long actorId);
    BatchMonthlySummaryResponse getBatchMonthlySummary(Long batchId, YearMonth yearMonth);
}
