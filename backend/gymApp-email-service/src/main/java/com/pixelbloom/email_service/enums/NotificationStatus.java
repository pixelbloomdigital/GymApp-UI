package com.pixelbloom.email_service.enums;

public enum NotificationStatus {
    PENDING,    // created, not yet attempted
    SENT,       // delivered to Twilio successfully
    FAILED      // exhausted all retries
}
