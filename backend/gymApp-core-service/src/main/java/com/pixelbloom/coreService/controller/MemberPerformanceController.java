package com.pixelbloom.coreService.controller;

import com.pixelbloom.coreService.model.memberModel.MemberGoal;
import com.pixelbloom.coreService.model.memberModel.MemberHealthLog;
import com.pixelbloom.coreService.requestDto.CreateGoalRequest;
import com.pixelbloom.coreService.requestDto.LogHealthMetricsRequest;
import com.pixelbloom.coreService.requestDto.UpsertMemberExtendedProfileRequest;
import com.pixelbloom.coreService.responseDto.MemberExtendedProfileResponse;
import com.pixelbloom.coreService.responseDto.MemberProgressSummary;
import com.pixelbloom.coreService.service.DailyProgressEventPublisher;
import com.pixelbloom.coreService.service.MemberPerformanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Exposes member health metrics and goals APIs.
 * The GET /api/performance/goals/member/{memberId} endpoint satisfies the
 * daily-whatsapp-goal-update spec requirement (previously expected from a separate
 * gym-performance-service, now served directly by core-service).
 */
@Slf4j
@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class MemberPerformanceController {

    private final MemberPerformanceService memberPerformanceService;
    private final DailyProgressEventPublisher dailyProgressEventPublisher;

    /**
     * Log today's health metrics (weight and/or heart rate) for a member.
     * POST /api/performance/health/{memberId}
     */
    @PostMapping("/health/{memberId}")
    public ResponseEntity<MemberHealthLog> logHealthMetrics(
            @PathVariable Long memberId,
            @RequestBody LogHealthMetricsRequest request) {
        return ResponseEntity.ok(memberPerformanceService.logHealthMetrics(memberId, request));
    }

    /**
     * Create or replace the active fitness goal for a member.
     * POST /api/performance/goals/{memberId}
     */
    @PostMapping("/goals/{memberId}")
    public ResponseEntity<MemberGoal> createGoal(
            @PathVariable Long memberId,
            @RequestBody CreateGoalRequest request) {
        return ResponseEntity.ok(memberPerformanceService.createGoal(memberId, request));
    }

    /**
     * Get today's progress summary (health metrics + active goal) for a member.
     * Also triggers a Daily_Progress_Event on Kafka (deduplication-guarded).
     * GET /api/performance/goals/member/{memberId}
     */
    @GetMapping("/goals/member/{memberId}")
    public ResponseEntity<MemberProgressSummary> getProgressSummary(@PathVariable Long memberId) {
        MemberProgressSummary summary = memberPerformanceService.getProgressSummary(memberId);

        // On-demand Kafka trigger — failure must never affect the HTTP response
        try {
            dailyProgressEventPublisher.publishForMember(memberId);
        } catch (Exception e) {
            log.error("Goals API: failed to publish daily progress event for memberId={}: {}", memberId, e.getMessage());
        }

        return ResponseEntity.ok(summary);
    }

    /**
     * Get extended profile fields used by EditProfile.
     * GET /api/performance/profile/{memberId}
     */
    @GetMapping("/profile/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','VISITOR','TRAINER')")
    public ResponseEntity<MemberExtendedProfileResponse> getExtendedProfile(@PathVariable Long memberId) {
        return ResponseEntity.ok(memberPerformanceService.getExtendedProfile(memberId));
    }

    /**
     * Upsert extended profile fields used by EditProfile.
     * PUT /api/performance/profile/{memberId}
     */
    @PutMapping("/profile/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','VISITOR','TRAINER')")
    public ResponseEntity<MemberExtendedProfileResponse> upsertExtendedProfile(
            @PathVariable Long memberId,
            @RequestBody UpsertMemberExtendedProfileRequest request) {
        return ResponseEntity.ok(memberPerformanceService.upsertExtendedProfile(memberId, request));
    }
}
