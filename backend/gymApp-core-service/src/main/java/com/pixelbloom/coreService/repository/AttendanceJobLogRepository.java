package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.model.attendanceModel.AttendanceJobLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AttendanceJobLogRepository extends JpaRepository<AttendanceJobLog, Long> {

    Optional<AttendanceJobLog> findBySessionId(Long sessionId);
}
