package com.pixelbloom.coreService.model.attendanceModel;

import com.pixelbloom.coreService.enums.BatchType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "batch_pay_rates")
@Data
public class BatchPayRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BatchType batchType;

    /** null = applies to all batches of this type */
    private Long batchId;

    /** null = applies to all trainers */
    private Long trainerId;

    @Column(nullable = false)
    private BigDecimal ratePerHour;

    @Column(nullable = false)
    private LocalDate effectiveFrom;

    /** null = currently active */
    private LocalDate effectiveTo;

    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
