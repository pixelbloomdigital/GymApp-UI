package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.service.DailyProgressEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyProgressScheduler {

    private final DailyProgressEventPublisher dailyProgressEventPublisher;

    /**
     * Runs every evening at 20:00 (configurable via notification.daily-progress.schedule).
     * Publishes Daily_Progress_Events for all members who attended today and haven't received one yet.
     */
    @Scheduled(cron = "${notification.daily-progress.schedule:0 0 20 * * *}")
    public void runDailyProgressJob() {
        log.info("DailyProgressScheduler: starting daily progress event job");
        try {
            dailyProgressEventPublisher.publishForAllTodayAttendees();
            log.info("DailyProgressScheduler: daily progress event job completed");
        } catch (Exception e) {
            log.error("DailyProgressScheduler: job failed: {}", e.getMessage(), e);
        }
    }
}
