package com.pixelbloom.coreService.controller;

import com.pixelbloom.coreService.enums.BatchType;
import com.pixelbloom.coreService.requestDto.CreateBatchRequest;
import com.pixelbloom.coreService.responseDto.BatchResponse;
import com.pixelbloom.coreService.service.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    /** GET /api/batches?type=ZUMBA */
    @GetMapping
    public ResponseEntity<List<BatchResponse>> getAllBatches(
            @RequestParam(required = false) BatchType type) {
        return ResponseEntity.ok(batchService.getAllActiveBatches(type));
    }

    /** GET /api/batches/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<BatchResponse> getBatch(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchById(id));
    }

    /** POST /api/batches — ADMIN only */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BatchResponse> createBatch(@Valid @RequestBody CreateBatchRequest request) {
        return ResponseEntity.status(201).body(batchService.createBatch(request));
    }

    /** PUT /api/batches/{id} — ADMIN only */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BatchResponse> updateBatch(@PathVariable Long id,
                                                      @Valid @RequestBody CreateBatchRequest request) {
        return ResponseEntity.ok(batchService.updateBatch(id, request));
    }

    /** DELETE /api/batches/{id} — ADMIN only (soft delete) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateBatch(@PathVariable Long id) {
        batchService.deactivateBatch(id);
        return ResponseEntity.noContent().build();
    }
}
