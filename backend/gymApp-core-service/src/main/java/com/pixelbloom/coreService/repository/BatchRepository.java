package com.pixelbloom.coreService.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pixelbloom.coreService.enums.BatchType;
import com.pixelbloom.coreService.model.membershipModel.Batch;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByIsActiveTrue();
    List<Batch> findByTypeAndIsActiveTrue(BatchType type);
    List<Batch> findByTrainerIdAndIsActiveTrue(Long trainerId);
}
