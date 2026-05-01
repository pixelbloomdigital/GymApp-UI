package com.pixelbloom.publicInfo.service;

import com.pixelbloom.publicInfo.dto.EventRegistrationRequest;
import com.pixelbloom.publicInfo.dto.GymEventRequest;
import com.pixelbloom.publicInfo.entity.EventRegistration;
import com.pixelbloom.publicInfo.entity.GymEvent;
import com.pixelbloom.publicInfo.enums.EventType;

import java.util.List;

public interface GymEventService {
    List<GymEvent> getAllActiveEvents();
    List<GymEvent> getEventsByType(EventType type);
    GymEvent getEventById(Long id);
    GymEvent createEvent(GymEventRequest request);
    GymEvent updateEvent(Long id, GymEventRequest request);
    EventRegistration registerForEvent(Long eventId, EventRegistrationRequest request);
    List<EventRegistration> getRegistrations(Long eventId);
    void deleteEvent(Long id);
}
