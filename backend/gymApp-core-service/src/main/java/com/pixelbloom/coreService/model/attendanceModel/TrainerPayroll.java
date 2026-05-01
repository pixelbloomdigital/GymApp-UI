package com.pixelbloom.coreService.model.attendanceModel;

import com.pixelbloom.coreService.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trainer_payroll",
        uniqueConstraints = @UniqueConstraint(columnNames = {"trainer_id", "payroll_month"}))
@Data
public class TrainerPayroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trainer_id", nullable = false)
    private Long trainerId;

    /** "2026-03" */
    @Column(name = "payroll_month", nullable = false, length = 7)
    private String payrollMonth;

    private Double totalHoursWorked;

    private Integer totalSessionsConducted;

    private Integer totalSessionsCancelled;

    /** JSON: [{batchType, batchName, sessions, hours, ratePerHour, earnings}] */
    @Column(columnDefinition = "json")
    private String batchBreakdownJson;

    private BigDecimal totalEarnings;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private PayrollStatus status = PayrollStatus.DRAFT;

    private LocalDate paidOn;

    private String paymentReference;

    /** memberId of admin who approved */
    private Long approvedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
