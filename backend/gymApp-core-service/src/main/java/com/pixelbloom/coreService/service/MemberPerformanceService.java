package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.model.memberModel.MemberGoal;
import com.pixelbloom.coreService.model.memberModel.MemberHealthLog;
import com.pixelbloom.coreService.requestDto.CreateGoalRequest;
import com.pixelbloom.coreService.requestDto.LogHealthMetricsRequest;
import com.pixelbloom.coreService.requestDto.UpsertMemberExtendedProfileRequest;
import com.pixelbloom.coreService.responseDto.MemberExtendedProfileResponse;
import com.pixelbloom.coreService.responseDto.MemberProgressSummary;

public interface MemberPerformanceService {

    /** Log today's weight and/or heart rate for a member. */
    MemberHealthLog logHealthMetrics(Long memberId, LogHealthMetricsRequest request);

    /** Create or replace the active goal for a member. */
    MemberGoal createGoal(Long memberId, CreateGoalRequest request);

    /** Get today's progress summary (health metrics + active goal) for a member. */
    MemberProgressSummary getProgressSummary(Long memberId);

    /** Get extended profile fields stored across additional profile/health/goals tables. */
    MemberExtendedProfileResponse getExtendedProfile(Long memberId);

    /** Upsert extended profile fields across additional profile/health/goals tables. */
    MemberExtendedProfileResponse upsertExtendedProfile(Long memberId, UpsertMemberExtendedProfileRequest request);
}
