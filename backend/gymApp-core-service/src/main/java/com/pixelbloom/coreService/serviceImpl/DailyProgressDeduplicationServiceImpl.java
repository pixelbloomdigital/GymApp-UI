package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.service.DailyProgressDeduplicationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
public class DailyProgressDeduplicationServiceImpl implements DailyProgressDeduplicationService {

    /** Thread-safe set keyed by "memberId:date" */
    private final Set<String> sentKeys = Collections.synchronizedSet(new HashSet<>());

    @Override
    public boolean isAlreadySent(Long memberId, LocalDate date) {
        return sentKeys.contains(buildKey(memberId, date));
    }

    @Override
    public void markSent(Long memberId, LocalDate date) {
        sentKeys.add(buildKey(memberId, date));
    }

    @Override
    @Scheduled(cron = "0 0 0 * * *")
    public void resetForNewDay() {
        int cleared = sentKeys.size();
        sentKeys.clear();
        log.info("DailyProgressDeduplication: cleared {} entries at midnight", cleared);
    }

    private String buildKey(Long memberId, LocalDate date) {
        return memberId + ":" + date;
    }
}
