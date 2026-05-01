package com.pixelbloom.coreService.service;

public interface DailyProgressEventPublisher {

    /**
     * Publishes Daily_Progress_Events for all PRESENT/LATE members in the given session.
     * Called from TrainerAttendanceServiceImpl.endSession().
     */
    void publishForSession(Long sessionId);

    /**
     * Publishes Daily_Progress_Events for all members who attended today.
     * Called by the 20:00 scheduler as a fallback.
     */
    void publishForAllTodayAttendees();

    /**
     * Publishes a Daily_Progress_Event for a single member for today.
     * Called from the Goals API endpoint as an on-demand trigger.
     * Deduplication guard is applied — no-op if already sent today.
     */
    void publishForMember(Long memberId);
}
