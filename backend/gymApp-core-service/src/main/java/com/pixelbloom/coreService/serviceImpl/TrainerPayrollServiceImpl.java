package com.pixelbloom.coreService.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.coreService.enums.PayrollStatus;
import com.pixelbloom.coreService.enums.TrainerSessionStatus;
import com.pixelbloom.coreService.model.attendanceModel.TrainerAttendance;
import com.pixelbloom.coreService.model.attendanceModel.TrainerPayroll;
import com.pixelbloom.coreService.model.membershipModel.Batch;
import com.pixelbloom.coreService.repository.BatchRepository;
import com.pixelbloom.coreService.repository.TrainerAttendanceRepository;
import com.pixelbloom.coreService.repository.TrainerPayrollRepository;
import com.pixelbloom.coreService.responseDto.TrainerMonthlySummary;
import com.pixelbloom.coreService.responseDto.TrainerPayrollResponse;
import com.pixelbloom.coreService.service.TrainerPayrollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainerPayrollServiceImpl implements TrainerPayrollService {

    private final TrainerPayrollRepository payrollRepo;
    private final TrainerAttendanceRepository sessionRepo;
    private final TrainerAttendanceServiceImpl trainerAttendanceService;
    private final BatchRepository batchRepo;
    private final ObjectMapper objectMapper;

    // ─── Generate Payroll ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<TrainerPayrollResponse> generateMonthlyPayroll(YearMonth yearMonth, Long trainerId) {
        LocalDate start = yearMonth.atDay(1);
        LocalDate end   = yearMonth.atEndOfMonth();

        List<TrainerAttendance> completedSessions = sessionRepo.findCompletedSessionsBetween(start, end);

        if (trainerId != null)
            completedSessions = completedSessions.stream()
                    .filter(s -> s.getTrainerId().equals(trainerId))
                    .collect(Collectors.toList());

        // Group by trainerId
        Map<Long, List<TrainerAttendance>> byTrainer = completedSessions.stream()
                .collect(Collectors.groupingBy(TrainerAttendance::getTrainerId));

        List<TrainerPayrollResponse> results = new ArrayList<>();

        for (Map.Entry<Long, List<TrainerAttendance>> entry : byTrainer.entrySet()) {
            Long tid = entry.getKey();
            List<TrainerAttendance> sessions = entry.getValue();

            // Build summary using existing service method
            TrainerMonthlySummary summary = trainerAttendanceService.getTrainerMonthlySummary(tid, yearMonth);

            // Upsert payroll record
            TrainerPayroll payroll = payrollRepo.findByTrainerIdAndPayrollMonth(tid, yearMonth.toString())
                    .orElse(new TrainerPayroll());

            if (payroll.getStatus() == PayrollStatus.APPROVED || payroll.getStatus() == PayrollStatus.PAID)
                throw new RuntimeException("Payroll for trainer " + tid + " month " + yearMonth
                        + " is already " + payroll.getStatus() + " and cannot be regenerated");

            payroll.setTrainerId(tid);
            payroll.setPayrollMonth(yearMonth.toString());
            payroll.setTotalSessionsConducted(summary.getTotalSessionsConducted());
            payroll.setTotalSessionsCancelled(summary.getTotalSessionsCancelled());
            payroll.setTotalHoursWorked(summary.getTotalHoursWorked());
            payroll.setTotalEarnings(summary.getTotalEarnings());
            payroll.setStatus(PayrollStatus.DRAFT);

            try {
                payroll.setBatchBreakdownJson(objectMapper.writeValueAsString(summary.getBatchBreakdown()));
            } catch (Exception e) {
                log.warn("Failed to serialize batch breakdown for trainer {}", tid);
            }

            payrollRepo.save(payroll);
            results.add(toResponse(payroll, summary.getBatchBreakdown()));
        }

        return results;
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    @Override
    public List<TrainerPayrollResponse> getPayrollByMonth(YearMonth yearMonth) {
        return payrollRepo.findByPayrollMonth(yearMonth.toString()).stream()
                .map(p -> toResponse(p, parseBreakdown(p.getBatchBreakdownJson())))
                .collect(Collectors.toList());
    }

    @Override
    public TrainerPayrollResponse getTrainerPayroll(Long trainerId, YearMonth yearMonth) {
        TrainerPayroll p = payrollRepo.findByTrainerIdAndPayrollMonth(trainerId, yearMonth.toString())
                .orElseThrow(() -> new RuntimeException(
                        "No payroll for trainer " + trainerId + " month " + yearMonth));
        return toResponse(p, parseBreakdown(p.getBatchBreakdownJson()));
    }

    // ─── Approve ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TrainerPayrollResponse approvePayroll(Long payrollId, Long approvedBy) {
        TrainerPayroll p = findPayroll(payrollId);
        if (p.getStatus() != PayrollStatus.DRAFT)
            throw new RuntimeException("Only DRAFT payroll can be approved");
        p.setStatus(PayrollStatus.APPROVED);
        p.setApprovedBy(approvedBy);
        payrollRepo.save(p);
        return toResponse(p, parseBreakdown(p.getBatchBreakdownJson()));
    }

    // ─── Mark Paid ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TrainerPayrollResponse markAsPaid(Long payrollId, LocalDate paidOn, String paymentReference) {
        TrainerPayroll p = findPayroll(payrollId);
        if (p.getStatus() != PayrollStatus.APPROVED)
            throw new RuntimeException("Only APPROVED payroll can be marked as PAID");
        p.setStatus(PayrollStatus.PAID);
        p.setPaidOn(paidOn != null ? paidOn : LocalDate.now());
        p.setPaymentReference(paymentReference);
        payrollRepo.save(p);
        return toResponse(p, parseBreakdown(p.getBatchBreakdownJson()));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TrainerPayroll findPayroll(Long id) {
        return payrollRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll not found: " + id));
    }

    private TrainerPayrollResponse toResponse(TrainerPayroll p,
                                               List<TrainerMonthlySummary.BatchBreakdown> breakdown) {
        TrainerPayrollResponse r = new TrainerPayrollResponse();
        r.setPayrollId(p.getId());
        r.setTrainerId(p.getTrainerId());
        r.setPayrollMonth(p.getPayrollMonth());
        r.setTotalHoursWorked(p.getTotalHoursWorked() != null ? p.getTotalHoursWorked() : 0.0);
        r.setTotalSessionsConducted(p.getTotalSessionsConducted() != null ? p.getTotalSessionsConducted() : 0);
        r.setTotalSessionsCancelled(p.getTotalSessionsCancelled() != null ? p.getTotalSessionsCancelled() : 0);
        r.setTotalEarnings(p.getTotalEarnings() != null ? p.getTotalEarnings() : BigDecimal.ZERO);
        r.setStatus(p.getStatus());
        r.setPaidOn(p.getPaidOn());
        r.setPaymentReference(p.getPaymentReference());
        r.setApprovedBy(p.getApprovedBy());
        r.setBatchBreakdown(breakdown);
        return r;
    }

    @SuppressWarnings("unchecked")
    private List<TrainerMonthlySummary.BatchBreakdown> parseBreakdown(String json) {
        if (json == null) return Collections.emptyList();
        try {
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(
                            List.class, TrainerMonthlySummary.BatchBreakdown.class));
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
