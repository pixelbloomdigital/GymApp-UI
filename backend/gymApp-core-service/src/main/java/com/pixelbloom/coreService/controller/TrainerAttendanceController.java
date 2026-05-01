package com.pixelbloom.coreService.controller;

import com.pixelbloom.coreService.requestDto.MarkTrainerSessionRequest;
import com.pixelbloom.coreService.requestDto.StartSessionRequest;
import com.pixelbloom.coreService.responseDto.SessionSummaryResponse;
import com.pixelbloom.coreService.responseDto.TrainerMonthlySummary;
import com.pixelbloom.coreService.responseDto.TrainerSessionResponse;
import com.pixelbloom.coreService.service.TrainerAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer-attendance")
@RequiredArgsConstructor
public class TrainerAttendanceController {

    private final TrainerAttendanceService trainerAttendanceService;

    // ─── Trainer: session start / end ─────────────────────────────────────────

    /**
     * POST /api/trainer-attendance/session-start
     * Trainer marks their own session start. Creates IN_PROGRESS record.
     */
    @PostMapping("/session-start")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<TrainerSessionResponse> startSession(@RequestBody StartSessionRequest request) {
        return ResponseEntity.ok(trainerAttendanceService.startSession(request));
    }

    /**
     * POST /api/trainer-attendance/session-end?sessionId=501&endTime=07:00:00
     * Trainer marks session end. Calculates hoursWorked and sessionEarnings.
     */
    @PostMapping("/session-end")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<SessionSummaryResponse> endSession(
            @RequestParam Long sessionId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        return ResponseEntity.ok(trainerAttendanceService.endSession(sessionId, endTime));
    }

    // ─── Admin: manual session entry ──────────────────────────────────────────

    /**
     * POST /api/trainer-attendance
     * Admin manually records a trainer session (with start + end time).
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerSessionResponse> markSession(@RequestBody MarkTrainerSessionRequest request) {
        return ResponseEntity.ok(trainerAttendanceService.markSession(request));
    }

    /**
     * PATCH /api/trainer-attendance/{sessionId}/cancel
     * Admin cancels a session. Optionally assigns a substitute trainer.
     */
    @PatchMapping("/{sessionId}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerSessionResponse> cancelSession(
            @PathVariable Long sessionId,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) Long substituteTrainerId) {
        return ResponseEntity.ok(trainerAttendanceService.cancelSession(sessionId, reason, substituteTrainerId));
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    /**
     * GET /api/trainer-attendance/trainer/{trainerId}?from=2026-03-01&to=2026-03-31
     * Returns all sessions for a trainer within a date range.
     */
    @GetMapping("/trainer/{trainerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<TrainerSessionResponse>> getTrainerSessions(
            @PathVariable Long trainerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(trainerAttendanceService.getTrainerSessions(trainerId, from, to));
    }

    /**
     * GET /api/trainer-attendance/trainer/{trainerId}/month/{yearMonth}
     * Returns monthly summary: sessions, hours, earnings per batch type.
     * yearMonth format: 2026-03
     */
    @GetMapping("/trainer/{trainerId}/month/{yearMonth}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<TrainerMonthlySummary> getMonthlyMonthlySummary(
            @PathVariable Long trainerId,
            @PathVariable String yearMonth) {
        return ResponseEntity.ok(
                trainerAttendanceService.getTrainerMonthlySummary(trainerId, YearMonth.parse(yearMonth)));
    }
}
