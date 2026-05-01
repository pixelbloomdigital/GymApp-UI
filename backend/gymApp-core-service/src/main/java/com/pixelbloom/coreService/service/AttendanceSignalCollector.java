package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.model.attendanceModel.AttendanceSignal;
import com.pixelbloom.coreService.requestDto.BleSignalRequest;
import com.pixelbloom.coreService.requestDto.CheckInSignalRequest;
import com.pixelbloom.coreService.requestDto.GpsSignalRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Accepts and stores incoming attendance signals during an active session.
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
public interface AttendanceSignalCollector {

    /**
     * Persists a check-in signal from the mobile app gate.
     * Sets signalType=MOBILE_CHECK_IN and confidenceContribution=0.90.
     *
     * @param request the check-in signal request
     * @return the persisted AttendanceSignal
     */
    AttendanceSignal recordCheckIn(CheckInSignalRequest request);

    /**
     * Validates and persists a GPS proximity signal.
     * Rejects signals where the member is more than 100m from the gym center.
     *
     * @param request the GPS signal request containing latitude and longitude
     * @return the persisted AttendanceSignal with distanceFromGymMeters populated
     * @throws IllegalArgumentException if the GPS coordinates are more than 100m from the gym
     */
    AttendanceSignal recordGpsSignal(GpsSignalRequest request);

    /**
     * Persists a BLE beacon detection event.
     * Sets signalType=BLE_BEACON and confidenceContribution=0.75.
     *
     * @param request the BLE signal request containing beaconId and rssi
     * @return the persisted AttendanceSignal
     */
    AttendanceSignal recordBleSignal(BleSignalRequest request);

    /**
     * Returns all signals for a member within the given session time window.
     *
     * @param memberId    the member's ID
     * @param batchId     the batch ID
     * @param date        the session date
     * @param windowStart start of the session time window (inclusive)
     * @param windowEnd   end of the session time window (inclusive)
     * @return list of AttendanceSignal records within the window
     */
    List<AttendanceSignal> getSignalsForMember(Long memberId, Long batchId, LocalDate date,
                                               LocalDateTime windowStart, LocalDateTime windowEnd);
}
