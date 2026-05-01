package com.pixelbloom.email_service.service;

import com.pixelbloom.email_service.event.DailyProgressEventDto;

public interface WhatsAppMessageBuilder {

    /**
     * Builds the personalised daily progress WhatsApp message body.
     * Null optional fields (weight, heartRate, goalSummary) are cleanly omitted.
     */
    String buildDailyUpdateMessage(DailyProgressEventDto event);
}
