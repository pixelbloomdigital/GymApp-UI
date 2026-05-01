package com.pixelbloom.email_service.service;

public interface WhatsAppService {
    /**
     * Sends a WhatsApp message. Returns true on success, false on Twilio error.
     */
    boolean send(String phone, String message);
}
