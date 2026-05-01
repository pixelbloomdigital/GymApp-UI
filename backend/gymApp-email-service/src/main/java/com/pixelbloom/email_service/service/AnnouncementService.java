package com.pixelbloom.email_service.service;

import com.pixelbloom.email_service.event.AnnouncementEvent;
import com.pixelbloom.email_service.requestDto.AnnouncementRequest;
import com.pixelbloom.email_service.requestDto.DirectMessageRequest;
import com.pixelbloom.email_service.responseDto.AnnouncementResponse;

import java.util.List;
import java.util.Map;

public interface AnnouncementService {

    AnnouncementResponse createAnnouncement(AnnouncementRequest request);

    List<AnnouncementResponse> getActiveAnnouncements();

    void softDelete(Long id);

    void broadcastWhatsApp(AnnouncementEvent event);

    /** Send a WhatsApp message to a single member by memberId */
    Map<String, String> sendWhatsAppToMember(Long memberId, DirectMessageRequest request);

    /** Send an email to a single member by memberId */
    Map<String, String> sendEmailToMember(Long memberId, DirectMessageRequest request);
}
