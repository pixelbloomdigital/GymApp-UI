package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.responseDto.MemberProgressSummary;

import java.util.Optional;

public interface PerformanceServiceClient {

    /**
     * Fetches today's health metrics and goal summary for a member from the Performance Service.
     *
     * @param memberId the member to fetch data for
     * @return Optional containing the summary, or empty if member not found or service unavailable
     */
    Optional<MemberProgressSummary> fetchProgressSummary(Long memberId);
}
