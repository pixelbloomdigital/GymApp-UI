package com.pixelbloom.coreService.controller;

import com.pixelbloom.coreService.model.attendanceModel.AttendanceSignal;
import com.pixelbloom.coreService.requestDto.AttendanceOverrideRequest;
import com.pixelbloom.coreService.requestDto.BleSignalRequest;
import com.pixelbloom.coreService.requestDto.CheckInRequest;
import com.pixelbloom.coreService.requestDto.GpsSignalRequest;
import com.pixelbloom.coreService.requestDto.MarkAttendanceRequest;
import com.pixelbloom.coreService.requestDto.UpdateAttendanceRequest;
import com.pixelbloom.coreService.responseDto.AttendanceResponse;
import com.pixelbloom.coreService.responseDto.BatchMonthlySummaryResponse;
import com.pixelbloom.coreService.responseDto.MonthlyAttendanceSummary;
import com.pixelbloom.coreService.service.AttendanceService;
import com.pixelbloom.coreService.service.AttendanceSignalCollector;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceSignalCollector attendanceSignalCollector;

    // ─── Admin / Trainer: mark attendance ────────────────────────────────────

    /**
     * POST /api/attendance
     * Admin or Trainer marks attendance for a member.
     * Validates member has ACTIVE membership before marking.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<AttendanceResponse> markAttendance(@RequestBody MarkAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.markAttendance(request));
    }

    // ─── Member: self check-in / check-out ───────────────────────────────────

    /**
     * POST /api/attendance/check-in
     * Member self check-in. Records check-in time and creates attendance record.
     * Validates ACTIVE membership.
     */
    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<AttendanceResponse> checkIn(@RequestBody CheckInRequest request) {
        return ResponseEntity.ok(attendanceService.checkIn(request));
    }

    /**
     * POST /api/attendance/check-out?memberId=5&batchId=1
     * Member self check-out. Records check-out time on today's attendance record.
     */
    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<AttendanceResponse> checkOut(
            @RequestParam Long memberId,
            @RequestParam Long batchId) {
        return ResponseEntity.ok(attendanceService.checkOut(memberId, batchId));
    }

    // ─── Admin: date-based queries ────────────────────────────────────────────

    /**
     * GET /api/attendance/today
     * Returns all attendance records for today.
     */
    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<AttendanceResponse>> getTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getTodayAttendance());
    }

    /**
     * GET /api/attendance/date/2026-03-23
     * Returns all attendance records for a specific date.
     */
    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<AttendanceResponse>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }

    // ─── Member / Admin: member-based queries ─────────────────────────────────

    /**
     * GET /api/attendance/member/{memberId}
     * Returns full attendance history for a member.
     * Member can only access their own; Admin/Trainer can access any.
     */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<List<AttendanceResponse>> getByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByMember(memberId));
    }

    /**
     * GET /api/attendance/member/{memberId}/date/{date}?batchId=1
     * Returns attendance for a specific member on a specific date.
     */
    @GetMapping("/member/{memberId}/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<AttendanceResponse> getByMemberAndDate(
            @PathVariable Long memberId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long batchId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByMemberAndDate(memberId, date, batchId));
    }

    /**
     * GET /api/attendance/member/{memberId}/month/{yearMonth}
     * Returns monthly attendance summary with present/absent/late counts and percentage.
     * yearMonth format: 2026-03
     */
    @GetMapping("/member/{memberId}/month/{yearMonth}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<MonthlyAttendanceSummary> getMonthlyAttendance(
            @PathVariable Long memberId,
            @PathVariable String yearMonth) {
        return ResponseEntity.ok(
                attendanceService.getMonthlyAttendance(memberId, YearMonth.parse(yearMonth)));
    }

    // ─── Batch-based queries ──────────────────────────────────────────────────

    /**
     * GET /api/attendance/batch/{batchId}/date/{date}
     * Returns all attendance records for a batch on a specific date.
     */
    @GetMapping("/batch/{batchId}/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<AttendanceResponse>> getByBatchAndDate(
            @PathVariable Long batchId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByBatchAndDate(batchId, date));
    }

    // ─── Admin: update / delete ───────────────────────────────────────────────

    /**
     * PUT /api/attendance/{attendanceId}
     * Admin corrects an attendance record (status, check-in/out times, notes).
     */
    @PutMapping("/{attendanceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable Long attendanceId,
            @RequestBody UpdateAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.updateAttendance(attendanceId, request));
    }

    /**
     * DELETE /api/attendance/{attendanceId}
     * Admin deletes an attendance record.
     */
    @DeleteMapping("/{attendanceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long attendanceId) {
        attendanceService.deleteAttendance(attendanceId);
        return ResponseEntity.noContent().build();
    }

    // ─── AI signal ingestion ──────────────────────────────────────────────────

    /**
     * POST /api/attendance/signals/gps
     * Records a GPS proximity signal for attendance determination.
     * Requirements: 2.2
     */
    @PostMapping("/signals/gps")
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<AttendanceSignal> recordGpsSignal(@RequestBody GpsSignalRequest request) {
        return ResponseEntity.ok(attendanceSignalCollector.recordGpsSignal(request));
    }

    /**
     * POST /api/attendance/signals/ble
     * Records a BLE beacon detection event for attendance determination.
     * Requirements: 2.3
     */
    @PostMapping("/signals/ble")
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<AttendanceSignal> recordBleSignal(@RequestBody BleSignalRequest request) {
        return ResponseEntity.ok(attendanceSignalCollector.recordBleSignal(request));
    }

    // ─── AI override ──────────────────────────────────────────────────────────

    /**
     * PUT /api/attendance/{attendanceId}/override
     * Trainer or Admin overrides an AI-generated attendance record.
     * Requirements: 3.4, 3.5, 5.1, 5.2
     */
    @PutMapping("/{attendanceId}/override")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<AttendanceResponse> overrideAttendance(
            @PathVariable Long attendanceId,
            @RequestBody AttendanceOverrideRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long actorId = (Long) auth.getCredentials();
        try {
            return ResponseEntity.ok(attendanceService.overrideAttendance(attendanceId, request, actorId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── Batch monthly summary ────────────────────────────────────────────────

    /**
     * GET /api/attendance/batch/{batchId}/summary?month=2026-03
     * Returns monthly attendance summary for a batch.
     * Requirements: 9.4
     */
    @GetMapping("/batch/{batchId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<BatchMonthlySummaryResponse> getBatchMonthlySummary(
            @PathVariable Long batchId,
            @RequestParam String month) {
        return ResponseEntity.ok(attendanceService.getBatchMonthlySummary(batchId, YearMonth.parse(month)));
    }
}
