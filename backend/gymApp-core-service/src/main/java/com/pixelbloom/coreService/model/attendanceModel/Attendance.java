package com.pixelbloom.coreService.model.attendanceModel;

import com.pixelbloom.coreService.enums.AttendanceReviewStatus;
import com.pixelbloom.coreService.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance",
        uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "date", "batch_id"}))
@Data
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "batch_id", nullable = false)
    private Long batchId;

    @Column(nullable = false)
    private LocalDate date;

    private String timeSlot;          // e.g. "06:00-07:00"

    private LocalTime checkInTime;

    private LocalTime checkOutTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AttendanceStatus status;  // PRESENT, ABSENT, LATE, HALF_DAY

    /** "ADMIN", "TRAINER", or "SELF" */
    private String markedBy;

    /** memberId of the admin/trainer who marked it */
    private Long markedById;

    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- AI fields (all nullable for backward compatibility) ---

    private Boolean aiGenerated;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AttendanceStatus aiSuggestedStatus;

    private Double confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AttendanceReviewStatus reviewStatus;

    private Long overriddenBy;

    private LocalDateTime overriddenAt;

    private Long sessionId;
}
