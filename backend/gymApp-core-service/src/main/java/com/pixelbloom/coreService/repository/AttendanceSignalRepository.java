package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.model.attendanceModel.AttendanceSignal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AttendanceSignalRepository extends JpaRepository<AttendanceSignal, Long> {

    List<AttendanceSignal> findByMemberIdAndBatchIdAndDateAndSignalTimeBetween(
            Long memberId,
            Long batchId,
            LocalDate date,
            LocalDateTime start,
            LocalDateTime end);
}
