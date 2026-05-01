package com.pixelbloom.email_service.serviceImpls;

import com.pixelbloom.email_service.enums.NotificationStatus;
import com.pixelbloom.email_service.event.DailyProgressEventDto;
import com.pixelbloom.email_service.model.NotificationLog;
import com.pixelbloom.email_service.repository.NotificationLogRepository;
import com.pixelbloom.email_service.service.NotificationDispatchService;
import com.pixelbloom.email_service.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDispatchServiceImpl implements NotificationDispatchService {

    private static final int MAX_ATTEMPTS = 3;

    private final WhatsAppService whatsAppService;
    private final NotificationLogRepository notificationLogRepo;

    @Value("${notification.retry.interval-ms:5000}")
    private long retryIntervalMs;

    @Override
    public void dispatchWhatsApp(Long memberId, String memberPhone, String eventType, String messageBody) {
        NotificationLog log = new NotificationLog();
        log.setMemberId(memberId);
        log.setMemberPhone(memberPhone);
        log.setChannel("WHATSAPP");
        log.setEventType(eventType);
        log.setStatus(NotificationStatus.PENDING);
        log.setAttemptCount(0);
        log.setMessageBody(messageBody);
        notificationLogRepo.save(log);

        attemptDelivery(log);
    }

    // ─── Dispatch with retry ──────────────────────────────────────────────────

    @Override
    public void dispatchDailyProgress(DailyProgressEventDto event, String messageBody) {
        // Create a PENDING log entry
        NotificationLog log = new NotificationLog();
        log.setMemberId(event.getMemberId());
        log.setMemberPhone(event.getMemberPhone());
        log.setChannel("WHATSAPP");
        log.setEventType("DAILY_PROGRESS");
        log.setStatus(NotificationStatus.PENDING);
        log.setAttemptCount(0);
        log.setMessageBody(messageBody);
        notificationLogRepo.save(log);

        // Attempt delivery with up to MAX_ATTEMPTS retries
        attemptDelivery(log);
    }

    // ─── Scheduled retry job ──────────────────────────────────────────────────

    @Override
    @Scheduled(fixedDelayString = "${notification.retry.schedule-ms:300000}") // default: every 5 min
    public void retryFailed() {
        List<NotificationLog> failedLogs =
                notificationLogRepo.findByStatusAndAttemptCountLessThan(NotificationStatus.FAILED, MAX_ATTEMPTS);

        if (failedLogs.isEmpty()) return;

        log.info("NotificationRetryJob: retrying {} FAILED notification(s)", failedLogs.size());
        for (NotificationLog entry : failedLogs) {
            attemptDelivery(entry);
        }
    }

    // ─── Internal retry loop ──────────────────────────────────────────────────

    private void attemptDelivery(NotificationLog entry) {
        for (int attempt = entry.getAttemptCount() + 1; attempt <= MAX_ATTEMPTS; attempt++) {
            entry.setAttemptCount(attempt);

            boolean success = whatsAppService.send(entry.getMemberPhone(), entry.getMessageBody());

            if (success) {
                entry.setStatus(NotificationStatus.SENT);
                entry.setErrorMessage(null);
                notificationLogRepo.save(entry);
                log.info("NotificationDispatch: SENT memberId={} on attempt {}", entry.getMemberId(), attempt);
                return;
            }

            log.warn("NotificationDispatch: attempt {}/{} FAILED for memberId={}",
                    attempt, MAX_ATTEMPTS, entry.getMemberId());

            // Wait before next retry (skip wait on last attempt)
            if (attempt < MAX_ATTEMPTS) {
                try {
                    Thread.sleep(retryIntervalMs * attempt); // exponential-ish backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        // All attempts exhausted
        entry.setStatus(NotificationStatus.FAILED);
        entry.setErrorMessage("Exhausted " + MAX_ATTEMPTS + " delivery attempts");
        notificationLogRepo.save(entry);
        log.error("NotificationDispatch: FAILED permanently for memberId={} after {} attempts",
                entry.getMemberId(), MAX_ATTEMPTS);
    }
}
