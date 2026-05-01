package com.pixelbloom.email_service.serviceImpls;

import com.pixelbloom.email_service.event.RenewalReminderEvent;
import com.pixelbloom.email_service.event.WelcomeEvent;
import com.pixelbloom.email_service.service.NotificationDispatchService;
import com.pixelbloom.email_service.service.NotificationService;
import com.pixelbloom.email_service.service.PdfGeneratorService;
import com.pixelbloom.email_service.service.WhatsAppService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final PdfGeneratorService pdfGeneratorService;
    private final WhatsAppService whatsAppService;
    private final NotificationDispatchService notificationDispatchService;

    @Override
    public void sendWelcomeNotification(WelcomeEvent event) {
        try {
            Context ctx = new Context();
            ctx.setVariable("memberName", event.getMemberName());
            ctx.setVariable("planName", event.getPlanName());
            ctx.setVariable("startDate", event.getStartDate());
            ctx.setVariable("endDate", event.getEndDate());
            ctx.setVariable("batchName", event.getBatchName());
            ctx.setVariable("timeSlot", event.getTimeSlot());
            ctx.setVariable("paidAmount", event.getPaidAmount());
            ctx.setVariable("orderNumber", event.getOrderNumber());
            ctx.setVariable("dietPlanName", event.getDietPlanName());
            ctx.setVariable("dietStartDate", event.getDietStartDate());
            ctx.setVariable("dietEndDate", event.getDietEndDate());
            ctx.setVariable("goalDetails", event.getGoalDetails());

            String htmlBody = templateEngine.process("welcome-membership", ctx);

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(event.getMemberEmail());
            helper.setSubject("Welcome to GymApp — Your Membership is Active!");
            helper.setText(htmlBody, true);
            helper.addAttachment(
                    "membership-details.pdf",
                    new ByteArrayResource(pdfGeneratorService.generateWelcomePdf(event))
            );

            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {} for membershipId={}",
                    event.getMemberEmail(), event.getMembershipId(), e);
        }

        if (event.getMemberPhone() != null && !event.getMemberPhone().isBlank()) {
            String message = String.format(
                    "Welcome %s! Your %s membership is active from %s to %s. Batch: %s, Time: %s.",
                    event.getMemberName(),
                    event.getPlanName(),
                    event.getStartDate(),
                    event.getEndDate(),
                    event.getBatchName(),
                    event.getTimeSlot()
            );
            notificationDispatchService.dispatchWhatsApp(
                    event.getMemberId(), event.getMemberPhone(), "WELCOME", message);
        } else {
            log.warn("No phone for memberId={}, skipping WhatsApp", event.getMemberId());
        }
    }

    @Override
    public void sendRenewalReminder(RenewalReminderEvent event) {
        try {
            Context ctx = new Context();
            ctx.setVariable("memberName", event.getMemberName());
            ctx.setVariable("planName", event.getPlanName());
            ctx.setVariable("endDate", event.getEndDate());
            ctx.setVariable("batchName", event.getBatchName());

            String htmlBody = templateEngine.process("renewal-reminder", ctx);

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            helper.setTo(event.getMemberEmail());
            helper.setSubject("Membership Renewal Reminder — Expires in 2 Days");
            helper.setText(htmlBody, true);

            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send renewal email to {} for membershipId={}",
                    event.getMemberEmail(), event.getMembershipId(), e);
        }

        if (event.getMemberPhone() != null && !event.getMemberPhone().isBlank()) {
            String message = String.format(
                    "Hi %s, your %s membership expires on %s (Batch: %s). Please renew to avoid a lapse.",
                    event.getMemberName(),
                    event.getPlanName(),
                    event.getEndDate(),
                    event.getBatchName()
            );
            notificationDispatchService.dispatchWhatsApp(
                    event.getMemberId(), event.getMemberPhone(), "RENEWAL_REMINDER", message);
        } else {
            log.warn("No phone for memberId={}, skipping WhatsApp renewal reminder", event.getMemberId());
        }
    }
}
