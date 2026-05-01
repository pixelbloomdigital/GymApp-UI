package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.enums.TrainerSessionStatus;
import com.pixelbloom.coreService.model.attendanceModel.TrainerAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TrainerAttendanceRepository extends JpaRepository<TrainerAttendance, Long> {

    List<TrainerAttendance> findByTrainerId(Long trainerId);

    List<TrainerAttendance> findByTrainerIdAndStatus(Long trainerId, TrainerSessionStatus status);

    Optional<TrainerAttendance> findByTrainerIdAndBatchIdAndDateAndStatus(
            Long trainerId, Long batchId, LocalDate date, TrainerSessionStatus status);

    boolean existsByTrainerIdAndBatchIdAndDateAndStatus(
            Long trainerId, Long batchId, LocalDate date, TrainerSessionStatus status);

    @Query("SELECT t FROM TrainerAttendance t WHERE t.trainerId = :trainerId " +
           "AND t.date >= :startDate AND t.date <= :endDate")
    List<TrainerAttendance> findByTrainerIdAndDateBetween(
            @Param("trainerId") Long trainerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM TrainerAttendance t WHERE t.date >= :startDate AND t.date <= :endDate " +
           "AND t.status = 'COMPLETED'")
    List<TrainerAttendance> findCompletedSessionsBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
