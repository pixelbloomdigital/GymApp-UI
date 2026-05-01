package com.pixelbloom.email_service.serviceImpls;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.email_service.event.AnnouncementEvent;
import com.pixelbloom.email_service.model.Announcement;
import com.pixelbloom.email_service.repository.AnnouncementRepository;
import com.pixelbloom.email_service.requestDto.AnnouncementRequest;
import com.pixelbloom.email_service.requestDto.DirectMessageRequest;
import com.pixelbloom.email_service.responseDto.AnnouncementResponse;
import com.pixelbloom.email_service.service.AnnouncementService;
import com.pixelbloom.email_service.service.WhatsAppService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final WhatsAppService whatsAppService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final JavaMailSender mailSender;

    @Value("${core.service.url}")
    private String coreServiceUrl;

    @Override
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .targetAudience(request.getTargetAudience())
                .createdBy(request.getCreatedBy())
                .expiresAt(request.getExpiresAt())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        Announcement saved = announcementRepository.save(announcement);

        AnnouncementEvent event = new AnnouncementEvent(
                saved.getId(),
                saved.getTitle(),
                saved.getMessage(),
                saved.getType(),
                saved.getTargetAudience(),
                saved.getCreatedBy(),
                saved.getCreatedAt(),
                saved.getExpiresAt()
        );

        try {
            String jsonPayload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send("gym.announcement.broadcast", String.valueOf(saved.getId()), jsonPayload);
        } catch (Exception e) {
            log.error("Failed to serialize AnnouncementEvent for id={}: {}", saved.getId(), e.getMessage());
        }

        return toResponse(saved);
    }

    @Override
    public List<AnnouncementResponse> getActiveAnnouncements() {
        return announcementRepository
                .findByIsActiveTrueAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void softDelete(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found: " + id));
        announcement.setIsActive(false);
        announcementRepository.save(announcement);
    }

    @Override
    public void broadcastWhatsApp(AnnouncementEvent event) {
        String url = coreServiceUrl + "/api/members";
        List<?> members;
        try {
            members = restTemplate.getForObject(url, List.class);
        } catch (Exception e) {
            log.error("Core service unreachable for announcementId={}", event.getId());
            return;
        }

        if (members == null) {
            return;
        }

        for (Object memberObj : members) {
            Map<String, Object> member = (Map<String, Object>) memberObj;
            String phone = (String) member.get("phone");
            if (phone != null && !phone.isBlank()) {
                try {
                    String msg = event.getTitle() + "\n" + event.getMessage();
                    whatsAppService.send(phone, msg);
                } catch (Exception e) {
                    log.error("WhatsApp failed for memberId={} phone={}", member.get("id"), phone);
                }
            }
        }
    }

    @Override
    public Map<String, String> sendWhatsAppToMember(Long memberId, DirectMessageRequest request) {
        Map<String, Object> member = fetchMember(memberId);
        String phone = (String) member.get("phone");
        if (phone == null || phone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Member " + memberId + " has no phone number registered");
        }
        String body = request.getSubject() + "\n" + request.getMessage();
        boolean sent = whatsAppService.send(phone, body);
        if (!sent) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "WhatsApp delivery failed for memberId=" + memberId);
        }
        log.info("Direct WhatsApp sent to memberId={} phone={}", memberId, phone);
        return Map.of("status", "sent", "memberId", String.valueOf(memberId), "phone", phone);
    }

    @Override
    public Map<String, String> sendEmailToMember(Long memberId, DirectMessageRequest request) {
        Map<String, Object> member = fetchMember(memberId);
        String email = (String) member.get("email");
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Member " + memberId + " has no email registered");
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            helper.setTo(email);
            helper.setSubject(request.getSubject());
            helper.setText(request.getMessage(), false);
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Direct email failed for memberId={} email={}: {}", memberId, email, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Email delivery failed for memberId=" + memberId);
        }
        log.info("Direct email sent to memberId={} email={}", memberId, email);
        return Map.of("status", "sent", "memberId", String.valueOf(memberId), "email", email);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchMember(Long memberId) {
        String url = coreServiceUrl + "/api/members/internal/" + memberId;
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-Internal-Service", "email-service");
            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    Map.class
            );
            Map<String, Object> member = response.getBody();
            if (member == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found: " + memberId);
            }
            return member;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch memberId={} from core service: {}", memberId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Core service unreachable");
        }
    }

    private AnnouncementResponse toResponse(Announcement a) {
        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .message(a.getMessage())
                .type(a.getType())
                .targetAudience(a.getTargetAudience())
                .createdBy(a.getCreatedBy())
                .createdAt(a.getCreatedAt())
                .expiresAt(a.getExpiresAt())
                .isActive(a.getIsActive())
                .build();
    }
}
