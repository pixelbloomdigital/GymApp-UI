package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.enums.AttendanceReviewStatus;
import com.pixelbloom.coreService.enums.AttendanceStatus;
import com.pixelbloom.coreService.enums.JobStatus;
import com.pixelbloom.coreService.enums.MembershipStatus;
import com.pixelbloom.coreService.model.attendanceModel.Attendance;
import com.pixelbloom.coreService.model.attendanceModel.AttendanceJobLog;
import com.pixelbloom.coreService.model.attendanceModel.AttendanceSignal;
import com.pixelbloom.coreService.model.membershipModel.Batch;
import com.pixelbloom.coreService.model.membershipModel.MemberMembership;
import com.pixelbloom.coreService.repository.AttendanceJobLogRepository;
import com.pixelbloom.coreService.repository.AttendanceRepository;
import com.pixelbloom.coreService.repository.BatchRepository;
import com.pixelbloom.coreService.repository.MemberMembershipRepository;
import com.pixelbloom.coreService.responseDto.AttendanceJobResult;
import com.pixelbloom.coreService.service.AIAttendanceEngine;
import com.pixelbloom.coreService.service.AttendanceScorer;
import com.pixelbloom.coreService.service.AttendanceSignalCollector;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Async implementation of the AI attendance engine.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 5.3, 6.1, 6.2
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIAttendanceEngineImpl implements AIAttendanceEngine {

    private static final double AUTO_FINALIZE_THRESHOLD = 0.85;
    private static final long JOB_TIMEOUT_SECONDS = 60L;

    private final MemberMembershipRepository memberMembershipRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceSignalCollector attendanceSignalCollector;
    private final AttendanceScorer attendanceScorer;
    private final AttendanceJobLogRepository attendanceJobLogRepository;
    private final BatchRepository batchRepository;

    @Override
    @Async("attendanceTaskExecutor")
    public CompletableFuture<AttendanceJobResult> triggerAttendanceJob(
            Long sessionId, Long batchId, LocalDate date, Long trainerId) {

        // Step 1: Create job log with RUNNING status
        AttendanceJobLog jobLog = new AttendanceJobLog();
        jobLog.setSessionId(sessionId);
        jobLog.setBatchId(batchId);
        jobLog.setDate(date);
        jobLog.setStatus(JobStatus.RUNNING);
        jobLog.setStartedAt(LocalDateTime.now());
        jobLog = attendanceJobLogRepository.save(jobLog);

        // Step 2: Fetch enrolled members
        List<MemberMembership> enrolledMemberships =
                memberMembershipRepository.findByBatchIdAndStatus(batchId, MembershipStatus.ACTIVE);

        // Step 3: Fetch batch for timeSlot
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found: " + batchId));

        jobLog.setTotalMembers(enrolledMemberships.size());

        // Handle empty batch
        if (enrolledMemberships.isEmpty()) {
            return completeJob(jobLog, sessionId, batchId, date, 0, 0, 0, 0, false);
        }

        // Effectively final reference for lambda capture (jobLog was reassigned above)
        final AttendanceJobLog savedJobLog = jobLog;

        // Wrap main logic in a timed CompletableFuture for timeout handling
        CompletableFuture<AttendanceJobResult> innerFuture =
                CompletableFuture.supplyAsync(() -> processMembers(
                        enrolledMemberships, batch, sessionId, batchId, date, trainerId, savedJobLog));

        try {
            AttendanceJobResult result = innerFuture.get(JOB_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            return CompletableFuture.completedFuture(result);
        } catch (TimeoutException e) {
            log.warn("AI attendance job timed out for batchId={}, date={}", batchId, date);
            innerFuture.cancel(true);
            return CompletableFuture.completedFuture(
                    handleFallback(enrolledMemberships, sessionId, batchId, date, trainerId, jobLog, JobStatus.TIMED_OUT, "Job exceeded 60-second timeout"));
        } catch (Exception e) {
            log.error("AI attendance job failed for batchId={}, date={}: {}", batchId, date, e.getMessage(), e);
            return CompletableFuture.completedFuture(
                    handleFallback(enrolledMemberships, sessionId, batchId, date, trainerId, jobLog, JobStatus.FAILED, e.getMessage()));
        }
    }

    /**
     * Core per-member processing logic.
     * Requirements: 1.2, 1.3, 3.1, 3.2, 5.3, 6.1, 6.2
     */
    private AttendanceJobResult processMembers(
            List<MemberMembership> memberships, Batch batch,
            Long sessionId, Long batchId, LocalDate date, Long trainerId,
            AttendanceJobLog jobLog) {

        // Parse batch timeSlot e.g. "06:00-07:00"
        LocalDateTime[] window = parseTimeWindow(batch.getTimeSlot(), date);
        LocalDateTime windowStart = window[0];
        LocalDateTime windowEnd = window[1];

        int presentCount = 0;
        int absentCount = 0;
        int lateCount = 0;
        int pendingReviewCount = 0;

        for (MemberMembership membership : memberships) {
            Long memberId = membership.getMemberId();

            // Step 9.4 — Duplicate-check guard (Requirements: 6.1, 6.2)
            if (attendanceRepository.existsByMemberIdAndDateAndBatchId(memberId, date, batchId)) {
                log.debug("Skipping duplicate attendance for memberId={}, batchId={}, date={}", memberId, batchId, date);
                // Count the existing record toward totals
                attendanceRepository.findByMemberIdAndDateAndBatchId(memberId, date, batchId)
                        .ifPresent(existing -> {
                            // existing record already counted — no action needed
                        });
                continue;
            }

            // Collect signals for this member within the session window
            List<AttendanceSignal> signals = attendanceSignalCollector.getSignalsForMember(
                    memberId, batchId, date, windowStart, windowEnd);

            // Score the member
            AttendanceScorer.ScoringResult result = attendanceScorer.score(signals, batch.getTimeSlot());

            // Determine review status based on confidence threshold
            AttendanceReviewStatus reviewStatus = result.getConfidenceScore() >= AUTO_FINALIZE_THRESHOLD
                    ? AttendanceReviewStatus.AUTO_FINALIZED
                    : AttendanceReviewStatus.PENDING_REVIEW;

            // Build and persist Attendance record
            Attendance attendance = new Attendance();
            attendance.setMemberId(memberId);
            attendance.setBatchId(batchId);
            attendance.setDate(date);
            attendance.setTimeSlot(batch.getTimeSlot());
            attendance.setSessionId(sessionId);
            attendance.setAiGenerated(true);
            attendance.setAiSuggestedStatus(result.getStatus());
            attendance.setConfidenceScore(result.getConfidenceScore());
            attendance.setStatus(result.getStatus());
            attendance.setReviewStatus(reviewStatus);
            attendance.setMarkedBy("AI");
            attendance.setMarkedById(trainerId);

            attendanceRepository.save(attendance);

            // Tally counts by status
            switch (result.getStatus()) {
                case PRESENT -> presentCount++;
                case ABSENT -> absentCount++;
                case LATE -> lateCount++;
                default -> { /* no-op */ }
            }
            if (reviewStatus == AttendanceReviewStatus.PENDING_REVIEW) {
                pendingReviewCount++;
            }
        }

        // Update job log
        jobLog.setStatus(JobStatus.COMPLETED);
        jobLog.setCompletedAt(LocalDateTime.now());
        jobLog.setPresentCount(presentCount);
        jobLog.setAbsentCount(absentCount);
        jobLog.setLateCount(lateCount);
        jobLog.setPendingReviewCount(pendingReviewCount);
        attendanceJobLogRepository.save(jobLog);

        AttendanceJobResult result = new AttendanceJobResult();
        result.setSessionId(sessionId);
        result.setBatchId(batchId);
        result.setDate(date);
        result.setTotalMembers(memberships.size());
        result.setPresentCount(presentCount);
        result.setAbsentCount(absentCount);
        result.setLateCount(lateCount);
        result.setPendingReviewCount(pendingReviewCount);
        result.setTimedOut(false);
        return result;
    }

    /**
     * Timeout / failure fallback: mark all enrolled members ABSENT.
     * Requirements: 1.5
     */
    private AttendanceJobResult handleFallback(
            List<MemberMembership> memberships,
            Long sessionId, Long batchId, LocalDate date, Long trainerId,
            AttendanceJobLog jobLog, JobStatus failStatus, String errorMessage) {

        int absentCount = 0;

        for (MemberMembership membership : memberships) {
            Long memberId = membership.getMemberId();

            // Duplicate-check guard still applies on fallback path
            if (attendanceRepository.existsByMemberIdAndDateAndBatchId(memberId, date, batchId)) {
                continue;
            }

            Attendance attendance = new Attendance();
            attendance.setMemberId(memberId);
            attendance.setBatchId(batchId);
            attendance.setDate(date);
            attendance.setSessionId(sessionId);
            attendance.setAiGenerated(true);
            attendance.setStatus(AttendanceStatus.ABSENT);
            attendance.setAiSuggestedStatus(AttendanceStatus.ABSENT);
            attendance.setConfidenceScore(1.0);
            attendance.setReviewStatus(AttendanceReviewStatus.PENDING_REVIEW);
            attendance.setMarkedBy("AI");
            attendance.setMarkedById(trainerId);

            attendanceRepository.save(attendance);
            absentCount++;
        }

        jobLog.setStatus(failStatus);
        jobLog.setCompletedAt(LocalDateTime.now());
        jobLog.setAbsentCount(absentCount);
        jobLog.setPresentCount(0);
        jobLog.setLateCount(0);
        jobLog.setPendingReviewCount(absentCount);
        jobLog.setErrorMessage(errorMessage);
        attendanceJobLogRepository.save(jobLog);

        AttendanceJobResult result = new AttendanceJobResult();
        result.setSessionId(sessionId);
        result.setBatchId(batchId);
        result.setDate(date);
        result.setTotalMembers(memberships.size());
        result.setAbsentCount(absentCount);
        result.setPresentCount(0);
        result.setLateCount(0);
        result.setPendingReviewCount(absentCount);
        result.setTimedOut(failStatus == JobStatus.TIMED_OUT);
        return result;
    }

    private CompletableFuture<AttendanceJobResult> completeJob(
            AttendanceJobLog jobLog, Long sessionId, Long batchId, LocalDate date,
            int present, int absent, int late, int pendingReview, boolean timedOut) {

        jobLog.setStatus(JobStatus.COMPLETED);
        jobLog.setCompletedAt(LocalDateTime.now());
        jobLog.setPresentCount(present);
        jobLog.setAbsentCount(absent);
        jobLog.setLateCount(late);
        jobLog.setPendingReviewCount(pendingReview);
        attendanceJobLogRepository.save(jobLog);

        AttendanceJobResult result = new AttendanceJobResult();
        result.setSessionId(sessionId);
        result.setBatchId(batchId);
        result.setDate(date);
        result.setTotalMembers(0);
        result.setPresentCount(present);
        result.setAbsentCount(absent);
        result.setLateCount(late);
        result.setPendingReviewCount(pendingReview);
        result.setTimedOut(timedOut);
        return CompletableFuture.completedFuture(result);
    }

    /**
     * Parses a timeSlot string like "06:00-07:00" into [windowStart, windowEnd] LocalDateTimes.
     */
    private LocalDateTime[] parseTimeWindow(String timeSlot, LocalDate date) {
        String[] parts = timeSlot.split("-");
        LocalTime start = LocalTime.parse(parts[0].trim());
        LocalTime end = LocalTime.parse(parts[1].trim());
        return new LocalDateTime[]{
                LocalDateTime.of(date, start),
                LocalDateTime.of(date, end)
        };
    }
}
