package com.pixelbloom.coreService.model.attendanceModel;

import com.pixelbloom.coreService.enums.SignalType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_signals")
@Data
public class AttendanceSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long memberId;

    private Long batchId;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SignalType signalType;

    private LocalDateTime signalTime;

    // GPS fields (nullable)
    private Double latitude;

    private Double longitude;

    private Double distanceFromGymMeters;

    // BLE fields (nullable)
    private String beaconId;

    private Integer rssi;

    private Double confidenceContribution;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
