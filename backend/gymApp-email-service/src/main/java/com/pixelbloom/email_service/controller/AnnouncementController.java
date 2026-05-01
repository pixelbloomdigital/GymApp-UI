package com.pixelbloom.email_service.controller;

import com.pixelbloom.email_service.requestDto.AnnouncementRequest;
import com.pixelbloom.email_service.requestDto.DirectMessageRequest;
import com.pixelbloom.email_service.responseDto.AnnouncementResponse;
import com.pixelbloom.email_service.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request) {
        AnnouncementResponse response = announcementService.createAnnouncement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<AnnouncementResponse>> getActiveAnnouncements() {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDelete(@PathVariable Long id) {
        announcementService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/announcements/whatsapp/{memberId}
     * Send an independent WhatsApp message to a single gym member.
     */
    @PostMapping("/whatsapp/{memberId}")
    public ResponseEntity<Map<String, String>> sendWhatsApp(
            @PathVariable Long memberId,
            @Valid @RequestBody DirectMessageRequest request) {
        return ResponseEntity.ok(announcementService.sendWhatsAppToMember(memberId, request));
    }

    /**
     * POST /api/announcements/email/{memberId}
     * Send an independent email to a single gym member.
     */
    @PostMapping("/email/{memberId}")
    public ResponseEntity<Map<String, String>> sendEmail(
            @PathVariable Long memberId,
            @Valid @RequestBody DirectMessageRequest request) {
        return ResponseEntity.ok(announcementService.sendEmailToMember(memberId, request));
    }
}
