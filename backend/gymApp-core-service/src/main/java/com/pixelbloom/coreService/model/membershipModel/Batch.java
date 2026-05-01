package com.pixelbloom.coreService.model.membershipModel;

import com.pixelbloom.coreService.enums.BatchType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "batches")
@Data
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private BatchType type;

    private String timeSlot;          // e.g. "06:00-07:00"

    private Integer capacity;

    private Integer currentEnrollment = 0;

    private Long trainerId;

    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
