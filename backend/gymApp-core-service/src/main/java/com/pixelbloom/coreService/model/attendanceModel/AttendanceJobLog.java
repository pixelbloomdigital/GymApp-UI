package com.pixelbloom.coreService.model.attendanceModel;

import com.pixelbloom.coreService.enums.JobStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_job_logs")
@Data
public class AttendanceJobLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sessionId;

    private Long batchId;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JobStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private Integer totalMembers;

    private Integer presentCount;

    private Integer absentCount;

    private Integer lateCount;

    private Integer pendingReviewCount;

    private String errorMessage;
}
