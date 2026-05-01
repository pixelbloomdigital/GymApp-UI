package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.model.attendanceModel.TrainerPayroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainerPayrollRepository extends JpaRepository<TrainerPayroll, Long> {

    List<TrainerPayroll> findByPayrollMonth(String payrollMonth);

    Optional<TrainerPayroll> findByTrainerIdAndPayrollMonth(Long trainerId, String payrollMonth);

    List<TrainerPayroll> findByTrainerId(Long trainerId);
}
