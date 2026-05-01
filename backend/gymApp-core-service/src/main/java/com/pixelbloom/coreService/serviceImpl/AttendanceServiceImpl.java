package com.pixelbloom.coreService.serviceImpl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pixelbloom.coreService.enums.AttendanceReviewStatus;
import com.pixelbloom.coreService.enums.AttendanceStatus;
import com.pixelbloom.coreService.enums.MembershipStatus;
import com.pixelbloom.coreService.exception.BusinessRuleException;
import com.pixelbloom.coreService.model.attendanceModel.Attendance;
import com.pixelbloom.coreService.repository.AttendanceRepository;
import com.pixelbloom.coreService.repository.BatchRepository;
import com.pixelbloom.coreService.repository.MemberMembershipRepository;
import com.pixelbloom.coreService.requestDto.AttendanceOverrideRequest;
import com.pixelbloom.coreService.requestDto.CheckInRequest;
import com.pixelbloom.coreService.requestDto.MarkAttendanceRequest;
import com.pixelbloom.coreService.requestDto.UpdateAttendanceRequest;
import com.pixelbloom.coreService.responseDto.AttendanceResponse;
import com.pixelbloom.coreService.responseDto.BatchMonthlySummaryResponse;
import com.pixelbloom.coreService.responseDto.MonthlyAttendanceSummary;
import com.pixelbloom.coreService.service.AttendanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepo;
    private final MemberMembershipRepository membershipRepo;
    private final BatchRepository batchRepo;

    // ─── Mark Attendance (Admin / Trainer) ───────────────────────────────────

    @Override
    @Transactional
    public AttendanceResponse markAttendance(MarkAttendanceRequest request) {
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        if (attendanceRepo.existsByMemberIdAndDateAndBatchId(request.getMemberId(), date, request.getBatchId()))
            throw new BusinessRuleException(
                    "Attendance already marked for member " + request.getMemberId() + " on " + date);

        Attendance a = new Attendance();
        a.setMemberId(request.getMemberId());
        a.setBatchId(request.getBatchId());
        a.setDate(date);
        a.setTimeSlot(request.getTimeSlot());
        a.setStatus(request.getStatus() != null ? request.getStatus() : AttendanceStatus.PRESENT);
        a.setMarkedBy("ADMIN");
        a.setMarkedById(request.getMarkedById());
        a.setNotes(request.getNotes());
        a.setCheckInTime(LocalTime.now());

        return toResponse(attendanceRepo.save(a));
    }

    // ─── Self Check-In (Member) ───────────────────────────────────────────────

    @Override
    @Transactional
    public AttendanceResponse checkIn(CheckInRequest request) {
        LocalDate today = LocalDate.now();

        validateActiveMembership(request.getMemberId());

        if (attendanceRepo.existsByMemberIdAndDateAndBatchId(request.getMemberId(), today, request.getBatchId()))
            throw new RuntimeException("Already checked in today for this batch");

        Attendance a = new Attendance();
        a.setMemberId(request.getMemberId());
        a.setBatchId(request.getBatchId());
        a.setDate(today);
        a.setTimeSlot(request.getTimeSlot());
        a.setCheckInTime(LocalTime.now());
        a.setStatus(AttendanceStatus.PRESENT);
        a.setMarkedBy("SELF");
        a.setMarkedById(request.getMemberId());

        return toResponse(attendanceRepo.save(a));
    }

    // ─── Self Check-Out (Member) ──────────────────────────────────────────────

    @Override
    @Transactional
    public AttendanceResponse checkOut(Long memberId, Long batchId) {
        Attendance a = attendanceRepo.findByMemberIdAndDateAndBatchId(memberId, LocalDate.now(), batchId)
                .orElseThrow(() -> new RuntimeException(
                        "No check-in found for member " + memberId + " today in batch " + batchId));

        if (a.getCheckOutTime() != null)
            throw new RuntimeException("Already checked out");

        a.setCheckOutTime(LocalTime.now());
        return toResponse(attendanceRepo.save(a));
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    @Override
    public List<AttendanceResponse> getTodayAttendance() {
        return attendanceRepo.findByDate(LocalDate.now()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        return attendanceRepo.findByDate(date).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getAttendanceByMember(Long memberId) {
        return attendanceRepo.findByMemberId(memberId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttendanceResponse getAttendanceByMemberAndDate(Long memberId, LocalDate date, Long batchId) {
        return attendanceRepo.findByMemberIdAndDateAndBatchId(memberId, date, batchId)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException(
                        "No attendance record for member " + memberId + " on " + date));
    }

    @Override
    public List<AttendanceResponse> getAttendanceByBatchAndDate(Long batchId, LocalDate date) {
        return attendanceRepo.findByBatchIdAndDate(batchId, date).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MonthlyAttendanceSummary getMonthlyAttendance(Long memberId, YearMonth yearMonth) {
        LocalDate start = yearMonth.atDay(1);
        LocalDate end   = yearMonth.atEndOfMonth();

        List<Attendance> records = attendanceRepo.findByMemberIdAndDateBetween(memberId, start, end);

        int present  = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        int absent   = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        int late     = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
        int halfDay  = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.HALF_DAY).count();
        int total    = yearMonth.lengthOfMonth();
        double pct   = total > 0 ? Math.round((present + late) * 100.0 / total * 10) / 10.0 : 0.0;

        MonthlyAttendanceSummary summary = new MonthlyAttendanceSummary();
        summary.setMemberId(memberId);
        summary.setYearMonth(yearMonth.toString());
        summary.setTotalDays(total);
        summary.setPresentDays(present);
        summary.setAbsentDays(absent);
        summary.setLateDays(late);
        summary.setHalfDays(halfDay);
        summary.setAttendancePercent(pct);
        summary.setRecords(records.stream().map(this::toResponse).collect(Collectors.toList()));

        return summary;
    }

    // ─── Admin Update / Delete ────────────────────────────────────────────────

    @Override
    @Transactional
    public AttendanceResponse updateAttendance(Long attendanceId, UpdateAttendanceRequest request) {
        Attendance a = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance not found: " + attendanceId));

        if (request.getStatus() != null)       a.setStatus(request.getStatus());
        if (request.getCheckInTime() != null)  a.setCheckInTime(request.getCheckInTime());
        if (request.getCheckOutTime() != null) a.setCheckOutTime(request.getCheckOutTime());
        if (request.getNotes() != null)        a.setNotes(request.getNotes());

        return toResponse(attendanceRepo.save(a));
    }

    @Override
    @Transactional
    public void deleteAttendance(Long attendanceId) {
        if (!attendanceRepo.existsById(attendanceId))
            throw new RuntimeException("Attendance not found: " + attendanceId);
        attendanceRepo.deleteById(attendanceId);
    }

    // ─── AI-Aware Operations ──────────────────────────────────────────────────

    @Override
    @Transactional
    public AttendanceResponse overrideAttendance(Long attendanceId, AttendanceOverrideRequest request, Long actorId) {
        Attendance a = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance not found: " + attendanceId));

        a.setStatus(request.getStatus());
        a.setReviewStatus(AttendanceReviewStatus.REVIEWED);
        a.setOverriddenBy(actorId);
        a.setOverriddenAt(java.time.LocalDateTime.now());
        // aiSuggestedStatus is intentionally NOT modified

        return toResponse(attendanceRepo.save(a));
    }

    @Override
    public BatchMonthlySummaryResponse getBatchMonthlySummary(Long batchId, YearMonth yearMonth) {
        LocalDate start = yearMonth.atDay(1);
        LocalDate end   = yearMonth.atEndOfMonth();

        List<Attendance> records = attendanceRepo.findByBatchIdAndDateBetween(batchId, start, end);

        // totalSessions = distinct dates with records
        long totalSessions = records.stream()
                .map(Attendance::getDate)
                .distinct()
                .count();

        // totalEnrolled = distinct members seen across all sessions
        long totalEnrolled = records.stream()
                .map(Attendance::getMemberId)
                .distinct()
                .count();

        // present + late records
        long presentOrLate = records.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE)
                .count();

        double averageAttendanceRate = (totalEnrolled > 0 && totalSessions > 0)
                ? Math.round(presentOrLate * 100.0 / (totalEnrolled * totalSessions) * 10) / 10.0
                : 0.0;

        long totalAiGeneratedRecords = records.stream()
                .filter(a -> Boolean.TRUE.equals(a.getAiGenerated()))
                .count();

        long totalOverriddenRecords = records.stream()
                .filter(a -> a.getReviewStatus() == AttendanceReviewStatus.REVIEWED)
                .count();

        double aiAccuracyRate = (totalAiGeneratedRecords > 0)
                ? Math.round((totalAiGeneratedRecords - totalOverriddenRecords) * 100.0 / totalAiGeneratedRecords * 10) / 10.0
                : 0.0;

        BatchMonthlySummaryResponse response = new BatchMonthlySummaryResponse();
        response.setBatchId(batchId);
        response.setYearMonth(yearMonth.toString());
        response.setAverageAttendanceRate(averageAttendanceRate);
        response.setAiAccuracyRate(aiAccuracyRate);
        response.setTotalSessions((int) totalSessions);
        response.setTotalAiGeneratedRecords((int) totalAiGeneratedRecords);
        response.setTotalOverriddenRecords((int) totalOverriddenRecords);

        batchRepo.findById(batchId).ifPresent(b -> response.setBatchName(b.getName()));

        return response;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void validateActiveMembership(Long memberId) {
        if (!membershipRepo.existsByMemberIdAndStatus(memberId, MembershipStatus.ACTIVE))
            throw new RuntimeException("Member " + memberId + " does not have an active membership");
    }

    private AttendanceResponse toResponse(Attendance a) {
        AttendanceResponse r = new AttendanceResponse();
        r.setAttendanceId(a.getId());
        r.setMemberId(a.getMemberId());
        r.setBatchId(a.getBatchId());
        r.setDate(a.getDate());
        r.setTimeSlot(a.getTimeSlot());
        r.setCheckInTime(a.getCheckInTime());
        r.setCheckOutTime(a.getCheckOutTime());
        r.setStatus(a.getStatus());
        r.setMarkedBy(a.getMarkedBy());
        r.setMarkedById(a.getMarkedById());
        r.setNotes(a.getNotes());
        r.setCreatedAt(a.getCreatedAt());

        // AI fields
        r.setAiGenerated(a.getAiGenerated());
        r.setAiSuggestedStatus(a.getAiSuggestedStatus());
        r.setConfidenceScore(a.getConfidenceScore());
        r.setReviewStatus(a.getReviewStatus() != null ? a.getReviewStatus().name() : null);
        r.setOverriddenBy(a.getOverriddenBy());
        r.setOverriddenAt(a.getOverriddenAt());

        // Enrich with batch name
        batchRepo.findById(a.getBatchId()).ifPresent(b -> r.setBatchName(b.getName()));

        return r;
    }
}
