package com.pixelbloom.email_service.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.email_service.event.RenewalReminderEvent;
import com.pixelbloom.email_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class RenewalReminderListener {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "gym.membership.renewal-reminder", groupId = "email-service-group")
    public void onRenewalEvent(String payload) {
        try {
            RenewalReminderEvent event = objectMapper.readValue(payload, RenewalReminderEvent.class);
            notificationService.sendRenewalReminder(event);
        } catch (Exception e) {
            log.error("Failed to deserialize RenewalReminderEvent payload: {} — error: {}", payload, e.getMessage());
        }
    }
}
