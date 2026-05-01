package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.enums.AttendanceStatus;
import com.pixelbloom.coreService.model.attendanceModel.AttendanceSignal;

import java.util.List;

public interface AttendanceScorer {

    /**
     * Given a list of signals for a member, returns a ScoringResult
     * containing the determined status and confidence score.
     *
     * @param signals       list of attendance signals collected for the member
     * @param batchTimeSlot batch time slot string, e.g. "06:00-07:00"
     * @return ScoringResult with status and confidence score
     */
    ScoringResult score(List<AttendanceSignal> signals, String batchTimeSlot);

    /**
     * Value class holding the result of an attendance scoring operation.
     */
    class ScoringResult {

        private final AttendanceStatus status;
        private final double confidenceScore;

        public ScoringResult(AttendanceStatus status, double confidenceScore) {
            this.status = status;
            this.confidenceScore = confidenceScore;
        }

        public AttendanceStatus getStatus() {
            return status;
        }

        public double getConfidenceScore() {
            return confidenceScore;
        }

        @Override
        public String toString() {
            return "ScoringResult{status=" + status + ", confidenceScore=" + confidenceScore + "}";
        }
    }
}
