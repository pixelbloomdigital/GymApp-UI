package com.pixelbloom.email_service.config;

import com.twilio.Twilio;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TwilioConfig {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @PostConstruct
    public void init() {
        if (accountSid == null || accountSid.isBlank() ||
            authToken  == null || authToken.isBlank()) {
            System.out.println("[TwilioConfig] Twilio credentials not set — SMS/WhatsApp notifications disabled.");
            return;
        }
        Twilio.init(accountSid, authToken);
        System.out.println("[TwilioConfig] Twilio initialized successfully.");
    }
}
