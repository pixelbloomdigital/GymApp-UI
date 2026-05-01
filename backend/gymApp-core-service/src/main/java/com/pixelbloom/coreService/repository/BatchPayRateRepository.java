package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.enums.BatchType;
import com.pixelbloom.coreService.model.attendanceModel.BatchPayRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BatchPayRateRepository extends JpaRepository<BatchPayRate, Long> {

    List<BatchPayRate> findByIsActiveTrueOrderByBatchTypeAsc();

    // Priority 1: trainer + batch specific
    Optional<BatchPayRate> findByTrainerIdAndBatchIdAndIsActiveTrue(Long trainerId, Long batchId);

    // Priority 2: trainer + batch type (no specific batch)
    Optional<BatchPayRate> findByTrainerIdAndBatchTypeAndBatchIdIsNullAndIsActiveTrue(
            Long trainerId, BatchType batchType);

    // Priority 3: batch type default (no trainer, no specific batch)
    Optional<BatchPayRate> findByBatchTypeAndTrainerIdIsNullAndBatchIdIsNullAndIsActiveTrue(
            BatchType batchType);
}
