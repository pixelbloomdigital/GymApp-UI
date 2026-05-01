package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.enums.AttendanceStatus;
import com.pixelbloom.coreService.event.DailyProgressEvent;
import com.pixelbloom.coreService.model.attendanceModel.Attendance;
import com.pixelbloom.coreService.model.attendanceModel.TrainerAttendance;
import com.pixelbloom.coreService.model.memberModel.Member;
import com.pixelbloom.coreService.model.membershipModel.Batch;
import com.pixelbloom.coreService.repository.AttendanceRepository;
import com.pixelbloom.coreService.repository.BatchRepository;
import com.pixelbloom.coreService.repository.CustomerRepository;
import com.pixelbloom.coreService.repository.TrainerAttendanceRepository;
import com.pixelbloom.coreService.responseDto.MemberProgressSummary;
import com.pixelbloom.coreService.service.CalorieEstimationService;
import com.pixelbloom.coreService.service.DailyProgressDeduplicationService;
import com.pixelbloom.coreService.service.DailyProgressEventPublisher;
import com.pixelbloom.coreService.service.KafkaProducerService;
import com.pixelbloom.coreService.service.PerformanceServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyProgressEventPublisherImpl implements DailyProgressEventPublisher {

    private final AttendanceRepository attendanceRepo;
    private final TrainerAttendanceRepository sessionRepo;
    private final BatchRepository batchRepo;
    private final CustomerRepository memberRepo;
    private final CalorieEstimationService calorieEstimationService;
    private final PerformanceServiceClient performanceServiceClient;
    private final DailyProgressDeduplicationService deduplicationService;
    private final KafkaProducerService kafkaProducerService;

    @Override
    public void publishForSession(Long sessionId) {
        TrainerAttendance session = sessionRepo.findById(sessionId).orElse(null);
        if (session == null) {
            log.warn("DailyProgressPublisher: session {} not found", sessionId);
            return;
        }
        List<Attendance> records = attendanceRepo.findByBatchIdAndDate(session.getBatchId(), session.getDate());
        Batch batch = batchRepo.findById(session.getBatchId()).orElse(null);

        for (Attendance attendance : records) {
            if (attendance.getStatus() == AttendanceStatus.PRESENT
                    || attendance.getStatus() == AttendanceStatus.LATE) {
                publishForMember(attendance.getMemberId(), batch, attendance.getDate());
            }
        }
    }

    @Override
    public void publishForAllTodayAttendees() {
        LocalDate today = LocalDate.now();
        List<Attendance> records = attendanceRepo.findByDate(today);

        if (records.isEmpty()) {
            log.info("DailyProgressScheduler: no attendance records for today ({})", today);
            return;
        }

        for (Attendance attendance : records) {
            if (attendance.getStatus() == AttendanceStatus.PRESENT
                    || attendance.getStatus() == AttendanceStatus.LATE) {
                Batch batch = batchRepo.findById(attendance.getBatchId()).orElse(null);
                publishForMember(attendance.getMemberId(), batch, today);
            }
        }
    }

    @Override
    public void publishForMember(Long memberId) {
        LocalDate today = LocalDate.now();
        // Find the member's most recent attendance record today to get the batch context
        List<Attendance> todayRecords = attendanceRepo.findByMemberIdAndDate(memberId, today);
        Attendance latest = todayRecords.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE)
                .findFirst()
                .orElse(null);

        Batch batch = null;
        if (latest != null) {
            batch = batchRepo.findById(latest.getBatchId()).orElse(null);
        }
        publishForMember(memberId, batch, today);
    }

    private void publishForMember(Long memberId, Batch batch, LocalDate date) {
        // Deduplication check
        if (deduplicationService.isAlreadySent(memberId, date)) {
            log.info("DailyProgressPublisher: skipping memberId={} on {} — already sent", memberId, date);
            return;
        }

        // Fetch member details
        Member member = memberRepo.findById(memberId).orElse(null);
        if (member == null) {
            log.warn("DailyProgressPublisher: member {} not found — skipping", memberId);
            return;
        }

        // Phone guard
        if (member.getPhone() == null || member.getPhone().isBlank()) {
            log.warn("DailyProgressPublisher: memberId={} has no phone number — skipping", memberId);
            return;
        }

        // Calorie estimation
        String activityType = batch != null && batch.getType() != null ? batch.getType().name() : null;
        String timeSlot     = batch != null ? batch.getTimeSlot() : null;
        int calories = calorieEstimationService.estimateCalories(activityType, timeSlot);

        // Health metrics from Performance Service (best-effort)
        Optional<MemberProgressSummary> progressOpt = performanceServiceClient.fetchProgressSummary(memberId);
        Double  todayWeight  = progressOpt.map(MemberProgressSummary::getTodayWeight).orElse(null);
        Integer heartRate    = progressOpt.map(MemberProgressSummary::getHeartRate).orElse(null);
        String  goalSummary  = progressOpt.map(MemberProgressSummary::getGoalSummary).orElse(null);

        // Build event
        DailyProgressEvent event = new DailyProgressEvent(
                memberId,
                member.getName(),
                member.getPhone(),
                batch != null ? batch.getId() : null,
                batch != null ? batch.getName() : null,
                activityType,
                date,
                date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                calories,
                todayWeight,
                heartRate,
                goalSummary
        );

        // Publish
        try {
            kafkaProducerService.publishDailyProgressEvent(event);
            deduplicationService.markSent(memberId, date);
        } catch (Exception e) {
            log.error("DailyProgressPublisher: failed to publish event for memberId={}: {}", memberId, e.getMessage());
        }
    }
}
