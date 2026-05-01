package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.model.memberModel.MemberGoal;
import com.pixelbloom.coreService.model.memberModel.MemberHealthLog;
import com.pixelbloom.coreService.repository.MemberGoalRepository;
import com.pixelbloom.coreService.repository.MemberHealthLogRepository;
import com.pixelbloom.coreService.responseDto.MemberProgressSummary;
import com.pixelbloom.coreService.service.PerformanceServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * Local implementation of PerformanceServiceClient.
 * Reads health metrics and goals directly from the core-service database
 * instead of calling an external performance microservice.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PerformanceServiceClientImpl implements PerformanceServiceClient {

    private final MemberHealthLogRepository healthLogRepository;
    private final MemberGoalRepository goalRepository;

    private static final DateTimeFormatter GOAL_DATE_FORMAT = DateTimeFormatter.ofPattern("MMMM yyyy");

    @Override
    public Optional<MemberProgressSummary> fetchProgressSummary(Long memberId) {
        LocalDate today = LocalDate.now();

        // Fetch today's health log (weight + heart rate)
        Optional<MemberHealthLog> healthLog =
                healthLogRepository.findTopByMemberIdAndLogDateOrderByCreatedAtDesc(memberId, today);

        // Fetch active goal
        Optional<MemberGoal> goal =
                goalRepository.findTopByMemberIdAndIsActiveTrueOrderByCreatedAtDesc(memberId);

        // If nothing is available, return empty
        if (healthLog.isEmpty() && goal.isEmpty()) {
            log.debug("No performance data found locally for memberId={}", memberId);
            return Optional.empty();
        }

        MemberProgressSummary summary = new MemberProgressSummary();
        healthLog.ifPresent(log -> {
            summary.setTodayWeight(log.getWeight());
            summary.setHeartRate(log.getHeartRate());
        });
        goal.ifPresent(g -> {
            String targetStr = g.getTargetDate() != null
                    ? " by " + g.getTargetDate().format(GOAL_DATE_FORMAT)
                    : "";
            summary.setGoalSummary("Goal: " + g.getGoalDescription() + targetStr);
        });

        return Optional.of(summary);
    }
}
