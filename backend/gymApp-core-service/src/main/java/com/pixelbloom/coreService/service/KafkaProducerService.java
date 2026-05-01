package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.event.DailyProgressEvent;
import com.pixelbloom.coreService.event.RenewalReminderEvent;
import com.pixelbloom.coreService.event.WelcomeEvent;

public interface KafkaProducerService {

    void publishWelcomeEvent(WelcomeEvent event);

    void publishRenewalReminderEvent(RenewalReminderEvent event);

    void publishDailyProgressEvent(DailyProgressEvent event);
}
