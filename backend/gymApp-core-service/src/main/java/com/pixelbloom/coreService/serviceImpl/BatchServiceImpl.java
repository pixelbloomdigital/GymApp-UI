package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.enums.BatchType;
import com.pixelbloom.coreService.model.membershipModel.Batch;
import com.pixelbloom.coreService.repository.BatchRepository;
import com.pixelbloom.coreService.requestDto.CreateBatchRequest;
import com.pixelbloom.coreService.responseDto.BatchResponse;
import com.pixelbloom.coreService.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepo;

    @Override
    @Transactional
    public BatchResponse createBatch(CreateBatchRequest request) {
        Batch batch = new Batch();
        batch.setName(request.getName());
        batch.setType(request.getType());
        batch.setTimeSlot(request.getTimeSlot());
        batch.setCapacity(request.getCapacity());
        batch.setCurrentEnrollment(0);
        batch.setTrainerId(request.getTrainerId());
        batch.setIsActive(true);
        return toResponse(batchRepo.save(batch));
    }

    @Override
    @Transactional
    public BatchResponse updateBatch(Long id, CreateBatchRequest request) {
        Batch batch = batchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + id));
        batch.setName(request.getName());
        batch.setType(request.getType());
        batch.setTimeSlot(request.getTimeSlot());
        batch.setCapacity(request.getCapacity());
        batch.setTrainerId(request.getTrainerId());
        if (request.getIsActive() != null) {
            batch.setIsActive(request.getIsActive());
        }
        return toResponse(batchRepo.save(batch));
    }

    @Override
    @Transactional
    public void deactivateBatch(Long id) {
        Batch batch = batchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + id));
        batch.setIsActive(false);
        batchRepo.save(batch);
    }

    @Override
    public List<BatchResponse> getAllActiveBatches(BatchType type) {
        List<Batch> batches = (type != null)
                ? batchRepo.findByTypeAndIsActiveTrue(type)
                : batchRepo.findByIsActiveTrue();
        return batches.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public BatchResponse getBatchById(Long id) {
        return toResponse(batchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + id)));
    }

    private BatchResponse toResponse(Batch b) {
        BatchResponse r = new BatchResponse();
        r.setId(b.getId());
        r.setName(b.getName());
        r.setType(b.getType());
        r.setTimeSlot(b.getTimeSlot());
        r.setCapacity(b.getCapacity());
        r.setCurrentEnrollment(b.getCurrentEnrollment());
        r.setAvailableSlots(b.getCapacity() - b.getCurrentEnrollment());
        r.setTrainerId(b.getTrainerId());
        r.setIsActive(b.getIsActive());
        return r;
    }
}
