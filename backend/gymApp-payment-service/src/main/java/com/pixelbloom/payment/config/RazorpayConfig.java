package com.pixelbloom.payment.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    /** Your service callback URL — Razorpay POSTs webhook here */
    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;
}
