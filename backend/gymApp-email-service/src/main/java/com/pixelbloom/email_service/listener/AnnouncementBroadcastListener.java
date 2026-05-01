package com.pixelbloom.email_service.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.email_service.event.AnnouncementEvent;
import com.pixelbloom.email_service.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class AnnouncementBroadcastListener {

    private final AnnouncementService announcementService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "gym.announcement.broadcast", groupId = "email-service-group")
    public void onAnnouncement(String payload) {
        try {
            AnnouncementEvent event = objectMapper.readValue(payload, AnnouncementEvent.class);
            announcementService.broadcastWhatsApp(event);
        } catch (Exception e) {
            log.error("Failed to deserialize AnnouncementEvent payload: {} — error: {}", payload, e.getMessage());
        }
    }
}
