package com.pixelbloom.email_service.serviceImpls;

import com.pixelbloom.email_service.service.WhatsAppService;
import com.twilio.exception.TwilioException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WhatsAppServiceImpl implements WhatsAppService {

    @Value("${twilio.whatsapp-from}")
    private String twilioFrom;

    @Override
    public boolean send(String phone, String message) {
        try {
            // Normalize: strip leading + or country code duplication
            String normalized = phone.replaceAll("[^0-9]", ""); // digits only
            if (normalized.startsWith("91") && normalized.length() == 12) {
                normalized = normalized.substring(2); // strip country code if already present
            }
            String toNumber = "whatsapp:+91" + normalized;

            Message msg = Message.creator(
                    new PhoneNumber(toNumber),
                    new PhoneNumber(twilioFrom),
                    message
            ).create();
            log.info("WhatsApp to={} | SID={} | Status={} | Error={} {}",
                    toNumber, msg.getSid(), msg.getStatus(), msg.getErrorCode(), msg.getErrorMessage());
            return true;
        } catch (TwilioException e) {
            log.error("Twilio error: {}", e.getMessage());
            return false;
        }
    }
}
