package com.pixelbloom.coreService.service;

import java.time.LocalDate;

public interface DailyProgressDeduplicationService {

    /** Returns true if a Daily_Progress_Event has already been published for this member today. */
    boolean isAlreadySent(Long memberId, LocalDate date);

    /** Records that a Daily_Progress_Event was published for this member on this date. */
    void markSent(Long memberId, LocalDate date);

    /** Clears all deduplication records — called at midnight each day. */
    void resetForNewDay();
}
