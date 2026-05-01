package com.pixelbloom.email_service.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.email_service.event.WelcomeEvent;
import com.pixelbloom.email_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class WelcomeEventListener {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "gym.member.welcome", groupId = "email-service-group")
    public void onWelcomeEvent(String payload) {
        try {
            WelcomeEvent event = objectMapper.readValue(payload, WelcomeEvent.class);
            notificationService.sendWelcomeNotification(event);
        } catch (Exception e) {
            log.error("Failed to deserialize WelcomeEvent payload: {} — error: {}", payload, e.getMessage());
            // commit offset by not rethrowing
        }
    }
}
