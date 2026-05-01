package com.pixelbloom.coreService.model.memberModel;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Stores daily health metric entries (weight, heart rate) logged by a member.
 * One entry per member per date is the expected pattern; latest entry wins.
 */
@Entity
@Table(name = "member_health_logs")
@Data
public class MemberHealthLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long memberId;

    @Column(nullable = false)
    private LocalDate logDate;

    /** Weight in kg — nullable if not logged */
    private Double weight;

    /** Height in cm */
    private Double height;

    /** Body fat percentage */
    private Double bodyFat;

    /** Heart rate in bpm — nullable if not logged */
    private Integer heartRate;

    private String medicalConditions;
    private String previousInjuries;
    private String currentMedications;
    private String allergies;

    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
