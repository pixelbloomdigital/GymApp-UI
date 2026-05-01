package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.responseDto.AttendanceJobResult;

import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;

/**
 * Orchestrates the automated attendance determination job for a batch session.
 * Requirements: 1.1, 1.4
 */
public interface AIAttendanceEngine {

    /**
     * Triggers an async attendance determination job for all enrolled members
     * of the given batch. Must complete within 60 seconds.
     *
     * @param sessionId the trainer session ID
     * @param batchId   the batch ID
     * @param date      the session date
     * @param trainerId the trainer who started the session (used as markedById)
     * @return a CompletableFuture containing the job result with counts
     */
    CompletableFuture<AttendanceJobResult> triggerAttendanceJob(
            Long sessionId, Long batchId, LocalDate date, Long trainerId);
}
