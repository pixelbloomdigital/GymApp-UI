package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.enums.SignalType;
import com.pixelbloom.coreService.model.attendanceModel.AttendanceSignal;
import com.pixelbloom.coreService.repository.AttendanceSignalRepository;
import com.pixelbloom.coreService.requestDto.BleSignalRequest;
import com.pixelbloom.coreService.requestDto.CheckInSignalRequest;
import com.pixelbloom.coreService.requestDto.GpsSignalRequest;
import com.pixelbloom.coreService.service.AttendanceSignalCollector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Implements signal ingestion for the AI attendance engine.
 * Requirements: 2.2, 2.4
 */
@Service
public class AttendanceSignalCollectorImpl implements AttendanceSignalCollector {

    private static final double CONFIDENCE_CHECK_IN = 0.90;
    private static final double CONFIDENCE_GPS      = 0.70;
    private static final double CONFIDENCE_BLE      = 0.75;
    private static final double MAX_GPS_DISTANCE_METERS = 100.0;
    private static final double EARTH_RADIUS_METERS = 6_371_000.0;

    @Value("${gym.location.latitude:0.0}")
    private double gymLatitude;

    @Value("${gym.location.longitude:0.0}")
    private double gymLongitude;

    private final AttendanceSignalRepository signalRepository;

    public AttendanceSignalCollectorImpl(AttendanceSignalRepository signalRepository) {
        this.signalRepository = signalRepository;
    }

    @Override
    public AttendanceSignal recordCheckIn(CheckInSignalRequest request) {
        AttendanceSignal signal = new AttendanceSignal();
        signal.setMemberId(request.getMemberId());
        signal.setBatchId(request.getBatchId());
        signal.setDate(request.getDate());
        signal.setSignalTime(request.getSignalTime());
        signal.setSignalType(SignalType.MOBILE_CHECK_IN);
        signal.setConfidenceContribution(CONFIDENCE_CHECK_IN);
        return signalRepository.save(signal);
    }

    @Override
    public AttendanceSignal recordGpsSignal(GpsSignalRequest request) {
        double distance = haversineDistance(
                gymLatitude, gymLongitude,
                request.getLatitude(), request.getLongitude());

        if (distance > MAX_GPS_DISTANCE_METERS) {
            throw new IllegalArgumentException(
                    "GPS signal rejected: member is more than 100m from gym");
        }

        AttendanceSignal signal = new AttendanceSignal();
        signal.setMemberId(request.getMemberId());
        signal.setBatchId(request.getBatchId());
        signal.setDate(request.getDate());
        signal.setSignalTime(request.getSignalTime());
        signal.setSignalType(SignalType.GPS);
        signal.setLatitude(request.getLatitude());
        signal.setLongitude(request.getLongitude());
        signal.setDistanceFromGymMeters(distance);
        signal.setConfidenceContribution(CONFIDENCE_GPS);
        return signalRepository.save(signal);
    }

    @Override
    public AttendanceSignal recordBleSignal(BleSignalRequest request) {
        AttendanceSignal signal = new AttendanceSignal();
        signal.setMemberId(request.getMemberId());
        signal.setBatchId(request.getBatchId());
        signal.setDate(request.getDate());
        signal.setSignalTime(request.getSignalTime());
        signal.setSignalType(SignalType.BLE_BEACON);
        signal.setBeaconId(request.getBeaconId());
        signal.setRssi(request.getRssi());
        signal.setConfidenceContribution(CONFIDENCE_BLE);
        return signalRepository.save(signal);
    }

    @Override
    public List<AttendanceSignal> getSignalsForMember(Long memberId, Long batchId, LocalDate date,
                                                      LocalDateTime windowStart, LocalDateTime windowEnd) {
        return signalRepository.findByMemberIdAndBatchIdAndDateAndSignalTimeBetween(
                memberId, batchId, date, windowStart, windowEnd);
    }

    /**
     * Computes the Haversine distance in meters between two lat/lon points.
     */
    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}
