package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.event.DailyProgressEvent;
import com.pixelbloom.coreService.event.RenewalReminderEvent;
import com.pixelbloom.coreService.event.WelcomeEvent;
import com.pixelbloom.coreService.service.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducerServiceImpl implements KafkaProducerService {

    private static final String WELCOME_TOPIC        = "gym.member.welcome";
    private static final String RENEWAL_TOPIC        = "gym.membership.renewal-reminder";
    private static final String DAILY_PROGRESS_TOPIC = "gym.member.daily-progress";

    // KafkaTemplate is configured with JsonSerializer — send objects directly, no manual serialization
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publishWelcomeEvent(WelcomeEvent event) {
        kafkaTemplate.send(WELCOME_TOPIC, String.valueOf(event.getMemberId()), event);
        log.info("Published WelcomeEvent to topic '{}' for memberId={}", WELCOME_TOPIC, event.getMemberId());
    }

    @Override
    public void publishRenewalReminderEvent(RenewalReminderEvent event) {
        kafkaTemplate.send(RENEWAL_TOPIC, String.valueOf(event.getMemberId()), event);
        log.info("Published RenewalReminderEvent to topic '{}' for memberId={}", RENEWAL_TOPIC, event.getMemberId());
    }

    @Override
    public void publishDailyProgressEvent(DailyProgressEvent event) {
        kafkaTemplate.send(DAILY_PROGRESS_TOPIC, String.valueOf(event.getMemberId()), event);
        log.info("Published DailyProgressEvent to topic '{}' for memberId={}", DAILY_PROGRESS_TOPIC, event.getMemberId());
    }
}
