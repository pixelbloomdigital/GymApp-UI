package com.pixelbloom.email_service.service;

import com.pixelbloom.email_service.event.DailyProgressEventDto;

public interface NotificationDispatchService {

    /**
     * Persists a PENDING notification log entry and attempts delivery with up to
     * maxAttempts retries. Updates status to SENT or FAILED accordingly.
     */
    void dispatchDailyProgress(DailyProgressEventDto event, String messageBody);

    /**
     * Generic WhatsApp dispatch with retry — usable for any event type (WELCOME, RENEWAL, etc.)
     */
    void dispatchWhatsApp(Long memberId, String memberPhone, String eventType, String messageBody);

    /**
     * Retries all FAILED notification log entries that haven't exceeded max attempts.
     * Called by the scheduled retry job.
     */
    void retryFailed();
}
