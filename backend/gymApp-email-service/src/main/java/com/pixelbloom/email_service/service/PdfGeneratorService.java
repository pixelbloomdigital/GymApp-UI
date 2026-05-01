package com.pixelbloom.email_service.service;

import com.pixelbloom.email_service.event.WelcomeEvent;

public interface PdfGeneratorService {
    byte[] generateWelcomePdf(WelcomeEvent event);
}
