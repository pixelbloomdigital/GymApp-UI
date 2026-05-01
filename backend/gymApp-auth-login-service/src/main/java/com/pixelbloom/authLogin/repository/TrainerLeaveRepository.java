package com.pixelbloom.authLogin.repository;

import com.pixelbloom.authLogin.entity.TrainerLeave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainerLeaveRepository extends JpaRepository<TrainerLeave, Long> {
    List<TrainerLeave> findByTrainerIdOrderByAppliedAtDesc(Long trainerId);
    List<TrainerLeave> findAllByOrderByAppliedAtDesc();
    List<TrainerLeave> findByStatusOrderByAppliedAtDesc(String status);
}
