package com.pixelbloom.coreService.controller;

import com.pixelbloom.coreService.responseDto.TrainerPayrollResponse;
import com.pixelbloom.coreService.service.TrainerPayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer-payroll")
@RequiredArgsConstructor
public class TrainerPayrollController {

    private final TrainerPayrollService payrollService;

    /**
     * POST /api/trainer-payroll/generate
     * Generates (or regenerates) DRAFT payroll for a month.
     * Body: { "month": "2026-03", "trainerId": null }  — null trainerId = all trainers
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrainerPayrollResponse>> generatePayroll(
            @RequestBody Map<String, Object> body) {
        String month = (String) body.get("month");
        Long trainerId = body.get("trainerId") != null
                ? Long.valueOf(body.get("trainerId").toString()) : null;
        return ResponseEntity.ok(payrollService.generateMonthlyPayroll(YearMonth.parse(month), trainerId));
    }

    /**
     * GET /api/trainer-payroll?month=2026-03
     * Returns all payroll records for a given month.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrainerPayrollResponse>> getPayrollByMonth(
            @RequestParam String month) {
        return ResponseEntity.ok(payrollService.getPayrollByMonth(YearMonth.parse(month)));
    }

    /**
     * GET /api/trainer-payroll/trainer/{trainerId}?month=2026-03
     * Trainer views their own payroll for a month.
     */
    @GetMapping("/trainer/{trainerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<TrainerPayrollResponse> getTrainerPayroll(
            @PathVariable Long trainerId,
            @RequestParam String month) {
        return ResponseEntity.ok(payrollService.getTrainerPayroll(trainerId, YearMonth.parse(month)));
    }

    /**
     * PATCH /api/trainer-payroll/{payrollId}/approve
     * Admin approves a DRAFT payroll. Requires adminId as query param.
     */
    @PatchMapping("/{payrollId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerPayrollResponse> approvePayroll(
            @PathVariable Long payrollId,
            @RequestParam Long approvedBy) {
        return ResponseEntity.ok(payrollService.approvePayroll(payrollId, approvedBy));
    }

    /**
     * PATCH /api/trainer-payroll/{payrollId}/paid
     * Admin marks an APPROVED payroll as PAID.
     * Body: { "paidOn": "2026-04-05", "paymentReference": "NEFT-001" }
     */
    @PatchMapping("/{payrollId}/paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerPayrollResponse> markAsPaid(
            @PathVariable Long payrollId,
            @RequestBody Map<String, String> body) {
        LocalDate paidOn = body.get("paidOn") != null ? LocalDate.parse(body.get("paidOn")) : null;
        String ref = body.get("paymentReference");
        return ResponseEntity.ok(payrollService.markAsPaid(payrollId, paidOn, ref));
    }
}
