package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.enums.AttendanceStatus;
import com.pixelbloom.coreService.enums.BatchType;
import com.pixelbloom.coreService.enums.TrainerSessionStatus;
import com.pixelbloom.coreService.model.attendanceModel.Attendance;
import com.pixelbloom.coreService.model.attendanceModel.BatchPayRate;
import com.pixelbloom.coreService.model.attendanceModel.TrainerAttendance;
import com.pixelbloom.coreService.model.membershipModel.Batch;
import com.pixelbloom.coreService.repository.AttendanceRepository;
import com.pixelbloom.coreService.repository.BatchPayRateRepository;
import com.pixelbloom.coreService.repository.BatchRepository;
import com.pixelbloom.coreService.repository.TrainerAttendanceRepository;
import com.pixelbloom.coreService.requestDto.BatchPayRateRequest;
import com.pixelbloom.coreService.requestDto.MarkTrainerSessionRequest;
import com.pixelbloom.coreService.requestDto.StartSessionRequest;
import com.pixelbloom.coreService.responseDto.SessionSummaryResponse;
import com.pixelbloom.coreService.responseDto.TrainerMonthlySummary;
import com.pixelbloom.coreService.responseDto.TrainerSessionResponse;
import com.pixelbloom.coreService.service.AIAttendanceEngine;
import com.pixelbloom.coreService.service.DailyProgressEventPublisher;
import com.pixelbloom.coreService.service.TrainerAttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainerAttendanceServiceImpl implements TrainerAttendanceService {

    private static final BigDecimal DEFAULT_RATE = new BigDecimal("1000");

    private final TrainerAttendanceRepository sessionRepo;
    private final BatchPayRateRepository payRateRepo;
    private final BatchRepository batchRepo;
    private final AttendanceRepository attendanceRepo;
    private final AIAttendanceEngine aiAttendanceEngine;
    private final DailyProgressEventPublisher dailyProgressEventPublisher;

    // ─── Session Start ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TrainerSessionResponse startSession(StartSessionRequest request) {
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        LocalTime startTime = request.getSessionStartTime() != null ? request.getSessionStartTime() : LocalTime.now();

        if (sessionRepo.existsByTrainerIdAndBatchIdAndDateAndStatus(
                request.getTrainerId(), request.getBatchId(), date, TrainerSessionStatus.IN_PROGRESS))
            throw new RuntimeException("Session already in progress for trainer "
                    + request.getTrainerId() + " in batch " + request.getBatchId() + " on " + date);

        Batch batch = batchRepo.findById(request.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found: " + request.getBatchId()));

        TrainerAttendance session = new TrainerAttendance();
        session.setTrainerId(request.getTrainerId());
        session.setBatchId(request.getBatchId());
        session.setBatchType(batch.getType());
        session.setDate(date);
        session.setSessionStartTime(startTime);
        session.setStatus(TrainerSessionStatus.IN_PROGRESS);

        TrainerAttendance saved = sessionRepo.save(session);

        // Trigger AI attendance job asynchronously — failure must not block the response
        try {
            aiAttendanceEngine.triggerAttendanceJob(
                    saved.getId(), saved.getBatchId(), saved.getDate(), saved.getTrainerId());
        } catch (Exception e) {
            log.error("AI attendance job failed to trigger for session {}: {}", saved.getId(), e.getMessage(), e);
        }

        return toResponse(saved, batch);
    }

    // ─── Session End ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public SessionSummaryResponse endSession(Long sessionId, LocalTime endTime) {
        TrainerAttendance session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        if (session.getStatus() != TrainerSessionStatus.IN_PROGRESS)
            throw new RuntimeException("Session is not IN_PROGRESS: " + sessionId);

        LocalTime end = endTime != null ? endTime : LocalTime.now();
        if (!end.isAfter(session.getSessionStartTime()))
            throw new RuntimeException("End time must be after start time");

        double hours = ChronoUnit.MINUTES.between(session.getSessionStartTime(), end) / 60.0;
        hours = Math.round(hours * 100.0) / 100.0;

        BigDecimal rate = resolvePayRate(session.getTrainerId(), session.getBatchId(), session.getBatchType());
        BigDecimal earnings = rate.multiply(BigDecimal.valueOf(hours)).setScale(2, RoundingMode.HALF_UP);

        session.setSessionEndTime(end);
        session.setHoursWorked(hours);
        session.setRatePerHour(rate);
        session.setSessionEarnings(earnings);
        session.setStatus(TrainerSessionStatus.COMPLETED);

        TrainerAttendance saved = sessionRepo.save(session);

        // Build session summary from attendance records
        List<Attendance> records = attendanceRepo.findByBatchIdAndDate(saved.getBatchId(), saved.getDate());

        int totalEnrolled = records.size();
        int presentCount = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        int absentCount  = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        int lateCount    = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
        int pendingReviewCount = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.PENDING_REVIEW).count();
        boolean aiGenerated = records.stream().anyMatch(a -> Boolean.TRUE.equals(a.getAiGenerated()));

        Batch batch = batchRepo.findById(saved.getBatchId()).orElse(null);

        SessionSummaryResponse summary = new SessionSummaryResponse();
        summary.setSessionId(saved.getId());
        summary.setBatchId(saved.getBatchId());
        summary.setBatchName(batch != null ? batch.getName() : null);
        summary.setDate(saved.getDate());
        summary.setTotalEnrolled(totalEnrolled);
        summary.setPresentCount(presentCount);
        summary.setAbsentCount(absentCount);
        summary.setLateCount(lateCount);
        summary.setPendingReviewCount(pendingReviewCount);
        summary.setAiAttendanceGenerated(aiGenerated);

        // Trigger daily WhatsApp progress update — failure must not block the response
        try {
            dailyProgressEventPublisher.publishForSession(saved.getId());
        } catch (Exception e) {
            log.error("DailyProgressPublisher failed for session {}: {}", saved.getId(), e.getMessage(), e);
        }

        return summary;
    }

    // ─── Admin Manual Entry ───────────────────────────────────────────────────

    @Override
    @Transactional
    public TrainerSessionResponse markSession(MarkTrainerSessionRequest request) {
        Batch batch = batchRepo.findById(request.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found: " + request.getBatchId()));

        TrainerAttendance session = new TrainerAttendance();
        session.setTrainerId(request.getTrainerId());
        session.setBatchId(request.getBatchId());
        session.setBatchType(batch.getType());
        session.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
        session.setSessionStartTime(request.getSessionStartTime());
        session.setSessionEndTime(request.getSessionEndTime());
        session.setNotes(request.getNotes());

        TrainerSessionStatus status = request.getStatus() != null
                ? request.getStatus() : TrainerSessionStatus.COMPLETED;
        session.setStatus(status);

        if (status == TrainerSessionStatus.COMPLETED
                && request.getSessionStartTime() != null
                && request.getSessionEndTime() != null) {
            double hours = ChronoUnit.MINUTES.between(
                    request.getSessionStartTime(), request.getSessionEndTime()) / 60.0;
            hours = Math.round(hours * 100.0) / 100.0;
            BigDecimal rate = resolvePayRate(request.getTrainerId(), request.getBatchId(), batch.getType());
            session.setHoursWorked(hours);
            session.setRatePerHour(rate);
            session.setSessionEarnings(rate.multiply(BigDecimal.valueOf(hours)).setScale(2, RoundingMode.HALF_UP));
        }

        return toResponse(sessionRepo.save(session), batch);
    }

    // ─── Cancel Session ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public TrainerSessionResponse cancelSession(Long sessionId, String reason, Long substituteTrainerId) {
        TrainerAttendance session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        session.setStatus(substituteTrainerId != null
                ? TrainerSessionStatus.SUBSTITUTE : TrainerSessionStatus.CANCELLED);
        session.setSubstituteTrainerId(substituteTrainerId);
        session.setNotes(reason);
        // Cancelled sessions earn nothing
        session.setSessionEarnings(BigDecimal.ZERO);

        Batch batch = batchRepo.findById(session.getBatchId()).orElse(null);
        return toResponse(sessionRepo.save(session), batch);
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    @Override
    public List<TrainerSessionResponse> getTrainerSessions(Long trainerId, LocalDate from, LocalDate to) {
        return sessionRepo.findByTrainerIdAndDateBetween(trainerId, from, to).stream()
                .map(s -> {
                    Batch batch = batchRepo.findById(s.getBatchId()).orElse(null);
                    return toResponse(s, batch);
                })
                .collect(Collectors.toList());
    }

    @Override
    public TrainerMonthlySummary getTrainerMonthlySummary(Long trainerId, YearMonth yearMonth) {
        LocalDate start = yearMonth.atDay(1);
        LocalDate end   = yearMonth.atEndOfMonth();

        List<TrainerAttendance> sessions = sessionRepo.findByTrainerIdAndDateBetween(trainerId, start, end);

        List<TrainerAttendance> completed = sessions.stream()
                .filter(s -> s.getStatus() == TrainerSessionStatus.COMPLETED)
                .collect(Collectors.toList());
        long cancelled = sessions.stream()
                .filter(s -> s.getStatus() == TrainerSessionStatus.CANCELLED).count();

        double totalHours = completed.stream()
                .mapToDouble(s -> s.getHoursWorked() != null ? s.getHoursWorked() : 0.0).sum();
        BigDecimal totalEarnings = completed.stream()
                .map(s -> s.getSessionEarnings() != null ? s.getSessionEarnings() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group by batchType for breakdown
        Map<BatchType, List<TrainerAttendance>> byType = completed.stream()
                .collect(Collectors.groupingBy(TrainerAttendance::getBatchType));

        List<TrainerMonthlySummary.BatchBreakdown> breakdown = byType.entrySet().stream()
                .map(e -> {
                    TrainerMonthlySummary.BatchBreakdown bd = new TrainerMonthlySummary.BatchBreakdown();
                    bd.setBatchType(e.getKey().name());
                    bd.setSessionsCompleted(e.getValue().size());
                    double hrs = e.getValue().stream()
                            .mapToDouble(s -> s.getHoursWorked() != null ? s.getHoursWorked() : 0.0).sum();
                    bd.setTotalHours(Math.round(hrs * 100.0) / 100.0);
                    BigDecimal rate = resolvePayRate(trainerId, null, e.getKey());
                    bd.setRatePerHour(rate);
                    bd.setTotalEarnings(e.getValue().stream()
                            .map(s -> s.getSessionEarnings() != null ? s.getSessionEarnings() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    // batch name from first session
                    e.getValue().stream().findFirst().ifPresent(s ->
                            batchRepo.findById(s.getBatchId()).ifPresent(b -> bd.setBatchName(b.getName())));
                    return bd;
                })
                .collect(Collectors.toList());

        List<TrainerSessionResponse> sessionResponses = sessions.stream()
                .map(s -> {
                    Batch batch = batchRepo.findById(s.getBatchId()).orElse(null);
                    return toResponse(s, batch);
                })
                .collect(Collectors.toList());

        TrainerMonthlySummary summary = new TrainerMonthlySummary();
        summary.setTrainerId(trainerId);
        summary.setYearMonth(yearMonth.toString());
        summary.setTotalSessionsConducted(completed.size());
        summary.setTotalSessionsCancelled((int) cancelled);
        summary.setTotalHoursWorked(Math.round(totalHours * 100.0) / 100.0);
        summary.setTotalEarnings(totalEarnings);
        summary.setBatchBreakdown(breakdown);
        summary.setSessions(sessionResponses);

        return summary;
    }

    // ─── Pay Rate Management ──────────────────────────────────────────────────

    @Override
    @Transactional
    public BatchPayRate createPayRate(BatchPayRateRequest request) {
        BatchPayRate rate = new BatchPayRate();
        mapPayRate(request, rate);
        return payRateRepo.save(rate);
    }

    @Override
    @Transactional
    public BatchPayRate updatePayRate(Long id, BatchPayRateRequest request) {
        BatchPayRate rate = payRateRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pay rate not found: " + id));
        mapPayRate(request, rate);
        return payRateRepo.save(rate);
    }

    @Override
    public List<BatchPayRate> getAllPayRates() {
        return payRateRepo.findByIsActiveTrueOrderByBatchTypeAsc();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    BigDecimal resolvePayRate(Long trainerId, Long batchId, BatchType batchType) {
        // Priority 1: trainer + batch specific
        if (trainerId != null && batchId != null) {
            Optional<BatchPayRate> r = payRateRepo.findByTrainerIdAndBatchIdAndIsActiveTrue(trainerId, batchId);
            if (r.isPresent()) return r.get().getRatePerHour();
        }
        // Priority 2: trainer + batch type
        if (trainerId != null) {
            Optional<BatchPayRate> r = payRateRepo
                    .findByTrainerIdAndBatchTypeAndBatchIdIsNullAndIsActiveTrue(trainerId, batchType);
            if (r.isPresent()) return r.get().getRatePerHour();
        }
        // Priority 3: batch type default
        Optional<BatchPayRate> r = payRateRepo
                .findByBatchTypeAndTrainerIdIsNullAndBatchIdIsNullAndIsActiveTrue(batchType);
        return r.map(BatchPayRate::getRatePerHour).orElse(DEFAULT_RATE);
    }

    private void mapPayRate(BatchPayRateRequest req, BatchPayRate rate) {
        rate.setBatchType(req.getBatchType());
        rate.setBatchId(req.getBatchId());
        rate.setTrainerId(req.getTrainerId());
        rate.setRatePerHour(req.getRatePerHour());
        rate.setEffectiveFrom(req.getEffectiveFrom() != null ? req.getEffectiveFrom() : LocalDate.now());
        rate.setEffectiveTo(req.getEffectiveTo());
        rate.setIsActive(true);
    }

    private TrainerSessionResponse toResponse(TrainerAttendance s, Batch batch) {
        TrainerSessionResponse r = new TrainerSessionResponse();
        r.setSessionId(s.getId());
        r.setTrainerId(s.getTrainerId());
        r.setBatchId(s.getBatchId());
        r.setBatchType(s.getBatchType());
        r.setDate(s.getDate());
        r.setSessionStartTime(s.getSessionStartTime());
        r.setSessionEndTime(s.getSessionEndTime());
        r.setHoursWorked(s.getHoursWorked());
        r.setRatePerHour(s.getRatePerHour());
        r.setSessionEarnings(s.getSessionEarnings());
        r.setStatus(s.getStatus());
        r.setSubstituteTrainerId(s.getSubstituteTrainerId());
        r.setNotes(s.getNotes());
        r.setCreatedAt(s.getCreatedAt());
        if (batch != null) r.setBatchName(batch.getName());
        return r;
    }
}
