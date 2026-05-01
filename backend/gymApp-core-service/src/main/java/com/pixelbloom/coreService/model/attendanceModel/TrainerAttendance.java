package com.pixelbloom.coreService.model.attendanceModel;

import com.pixelbloom.coreService.enums.BatchType;
import com.pixelbloom.coreService.enums.TrainerSessionStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "trainer_attendance")
@Data
public class TrainerAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long trainerId;

    @Column(nullable = false)
    private Long batchId;

    @Enumerated(EnumType.STRING)
    private BatchType batchType;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime sessionStartTime;

    private LocalTime sessionEndTime;

    /** Calculated on session end: sessionEndTime - sessionStartTime in hours */
    private Double hoursWorked;

    /** Rate per hour at the time of session (snapshot) */
    private BigDecimal ratePerHour;

    /** hoursWorked * ratePerHour */
    private BigDecimal sessionEarnings;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TrainerSessionStatus status;

    /** Set when another trainer covered this session */
    private Long substituteTrainerId;

    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
