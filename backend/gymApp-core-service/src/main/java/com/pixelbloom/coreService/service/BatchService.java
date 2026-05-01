package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.enums.BatchType;
import com.pixelbloom.coreService.requestDto.CreateBatchRequest;
import com.pixelbloom.coreService.responseDto.BatchResponse;

import java.util.List;

public interface BatchService {
    BatchResponse createBatch(CreateBatchRequest request);
    BatchResponse updateBatch(Long id, CreateBatchRequest request);
    void deactivateBatch(Long id);
    List<BatchResponse> getAllActiveBatches(BatchType type);
    BatchResponse getBatchById(Long id);
}
