package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.enums.AttendanceStatus;
import com.pixelbloom.coreService.enums.SignalType;
import com.pixelbloom.coreService.model.attendanceModel.AttendanceSignal;
import com.pixelbloom.coreService.service.AttendanceScorer;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

/**
 * Implements attendance scoring logic based on collected signals.
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */
@Service
public class AttendanceScorerImpl implements AttendanceScorer {

    private static final double BASE_MOBILE_CHECK_IN = 0.90;
    private static final double BASE_GPS             = 0.70;
    private static final double BASE_BLE_BEACON      = 0.75;
    private static final double MULTI_SIGNAL_BONUS   = 0.05;
    private static final double MAX_CONFIDENCE       = 1.0;
    private static final int    LATE_THRESHOLD_MINUTES = 10;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    public ScoringResult score(List<AttendanceSignal> signals, String batchTimeSlot) {
        // No signals → ABSENT with full confidence
        if (signals == null || signals.isEmpty()) {
            return new ScoringResult(AttendanceStatus.ABSENT, MAX_CONFIDENCE);
        }

        // Compute base confidence for each signal type
        List<Double> contributions = signals.stream()
                .map(s -> baseConfidence(s.getSignalType()))
                .sorted(Comparator.reverseOrder())
                .toList();

        // Highest base + 0.05 bonus per additional signal, capped at 1.0
        double confidence = contributions.get(0);
        for (int i = 1; i < contributions.size(); i++) {
            confidence += MULTI_SIGNAL_BONUS;
        }
        confidence = Math.min(confidence, MAX_CONFIDENCE);

        // Late determination: any MOBILE_CHECK_IN after batch start + 10 minutes
        boolean isLate = isLate(signals, batchTimeSlot);

        AttendanceStatus status = isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        return new ScoringResult(status, confidence);
    }

    private double baseConfidence(SignalType signalType) {
        return switch (signalType) {
            case MOBILE_CHECK_IN -> BASE_MOBILE_CHECK_IN;
            case GPS             -> BASE_GPS;
            case BLE_BEACON      -> BASE_BLE_BEACON;
        };
    }

    /**
     * Returns true if any MOBILE_CHECK_IN signal arrived more than 10 minutes
     * after the batch start time parsed from batchTimeSlot (e.g. "06:00-07:00").
     */
    private boolean isLate(List<AttendanceSignal> signals, String batchTimeSlot) {
        if (batchTimeSlot == null || batchTimeSlot.isBlank()) {
            return false;
        }

        LocalTime batchStart;
        try {
            String startPart = batchTimeSlot.split("-")[0].trim();
            batchStart = LocalTime.parse(startPart, TIME_FORMATTER);
        } catch (Exception e) {
            return false;
        }

        LocalTime lateThreshold = batchStart.plusMinutes(LATE_THRESHOLD_MINUTES);

        return signals.stream()
                .filter(s -> s.getSignalType() == SignalType.MOBILE_CHECK_IN)
                .anyMatch(s -> s.getSignalTime() != null
                        && s.getSignalTime().toLocalTime().isAfter(lateThreshold));
    }
}
