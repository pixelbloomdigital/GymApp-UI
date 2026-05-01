package com.pixelbloom.coreService.controller;

import com.pixelbloom.coreService.model.attendanceModel.BatchPayRate;
import com.pixelbloom.coreService.requestDto.BatchPayRateRequest;
import com.pixelbloom.coreService.service.TrainerAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batch-pay-rates")
@RequiredArgsConstructor
public class BatchPayRateController {

    private final TrainerAttendanceService trainerAttendanceService;

    /**
     * GET /api/batch-pay-rates
     * Returns all active pay rates.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BatchPayRate>> getAllPayRates() {
        return ResponseEntity.ok(trainerAttendanceService.getAllPayRates());
    }

    /**
     * POST /api/batch-pay-rates
     * Create a new pay rate. Can be batch-type-level, trainer-specific, or batch-specific.
     * Body: { "batchType": "ZUMBA", "ratePerHour": 1500, "effectiveFrom": "2026-01-01",
     *         "batchId": null, "trainerId": null }
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BatchPayRate> createPayRate(@RequestBody BatchPayRateRequest request) {
        return ResponseEntity.ok(trainerAttendanceService.createPayRate(request));
    }

    /**
     * PUT /api/batch-pay-rates/{id}
     * Update an existing pay rate.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BatchPayRate> updatePayRate(
            @PathVariable Long id,
            @RequestBody BatchPayRateRequest request) {
        return ResponseEntity.ok(trainerAttendanceService.updatePayRate(id, request));
    }
}
