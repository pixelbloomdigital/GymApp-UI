package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.model.attendanceModel.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByMemberId(Long memberId);

    List<Attendance> findByMemberIdAndDate(Long memberId, LocalDate date);

    Optional<Attendance> findByMemberIdAndDateAndBatchId(Long memberId, LocalDate date, Long batchId);

    boolean existsByMemberIdAndDateAndBatchId(Long memberId, LocalDate date, Long batchId);

    List<Attendance> findByBatchIdAndDate(Long batchId, LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.memberId = :memberId " +
           "AND a.date >= :startDate AND a.date <= :endDate")
    List<Attendance> findByMemberIdAndDateBetween(
            @Param("memberId") Long memberId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    long countByMemberIdAndDate(Long memberId, LocalDate date);

    List<Attendance> findByBatchIdAndDateBetween(Long batchId, LocalDate start, LocalDate end);
}
