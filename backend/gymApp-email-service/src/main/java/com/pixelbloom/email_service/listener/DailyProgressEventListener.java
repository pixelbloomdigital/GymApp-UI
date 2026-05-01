package com.pixelbloom.email_service.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.email_service.event.DailyProgressEventDto;
import com.pixelbloom.email_service.service.NotificationDispatchService;
import com.pixelbloom.email_service.service.WhatsAppMessageBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DailyProgressEventListener {

    private final ObjectMapper objectMapper;
    private final WhatsAppMessageBuilder whatsAppMessageBuilder;
    private final NotificationDispatchService notificationDispatchService;

    /**
     * Consumes daily progress events from Kafka.
     * Malformed messages are logged and offset is committed (no reprocessing).
     * Valid messages are dispatched via NotificationDispatchService which handles
     * DB tracking and up to 3 Twilio delivery retries.
     */
    @KafkaListener(topics = "gym.member.daily-progress", groupId = "email-service-group")
    public void onDailyProgressEvent(String payload) {
        DailyProgressEventDto event;
        try {
            event = objectMapper.readValue(payload, DailyProgressEventDto.class);
        } catch (Exception e) {
            log.error("DailyProgressListener: malformed payload — skipping. payload={}, error={}",
                    payload, e.getMessage());
            return; // commit offset — don't reprocess malformed messages
        }

        try {
            String message = whatsAppMessageBuilder.buildDailyUpdateMessage(event);
            notificationDispatchService.dispatchDailyProgress(event, message);
        } catch (Exception e) {
            log.error("DailyProgressListener: dispatch failed for memberId={}: {}",
                    event.getMemberId(), e.getMessage());
            // Rethrow so Kafka's DefaultErrorHandler can apply retries + DLT
            throw new RuntimeException("Dispatch failed for memberId=" + event.getMemberId(), e);
        }
    }
}
