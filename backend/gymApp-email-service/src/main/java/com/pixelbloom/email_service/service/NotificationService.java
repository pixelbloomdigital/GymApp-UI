package com.pixelbloom.email_service.service;

import com.pixelbloom.email_service.event.RenewalReminderEvent;
import com.pixelbloom.email_service.event.WelcomeEvent;

public interface NotificationService {

    void sendWelcomeNotification(WelcomeEvent event);

    void sendRenewalReminder(RenewalReminderEvent event);
}
