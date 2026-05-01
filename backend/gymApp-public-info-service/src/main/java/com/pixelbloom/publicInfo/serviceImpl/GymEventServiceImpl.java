package com.pixelbloom.publicInfo.serviceImpl;

import com.pixelbloom.publicInfo.dto.EventRegistrationRequest;
import com.pixelbloom.publicInfo.dto.GymEventRequest;
import com.pixelbloom.publicInfo.entity.EventRegistration;
import com.pixelbloom.publicInfo.entity.GymEvent;
import com.pixelbloom.publicInfo.enums.EventType;
import com.pixelbloom.publicInfo.repository.EventRegistrationRepository;
import com.pixelbloom.publicInfo.repository.GymEventRepository;
import com.pixelbloom.publicInfo.service.GymEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class GymEventServiceImpl implements GymEventService {

    private final GymEventRepository eventRepo;
    private final EventRegistrationRepository registrationRepo;

    @Override
    public List<GymEvent> getAllActiveEvents() {
        return eventRepo.findByIsActiveTrueOrderByEventDateAsc();
    }

    @Override
    public List<GymEvent> getEventsByType(EventType type) {
        return eventRepo.findByEventTypeAndIsActiveTrue(type);
    }

    @Override
    public GymEvent getEventById(Long id) {
        return eventRepo.findById(Objects.requireNonNull(id, "event id is required"))
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
    }

    @Override
    public GymEvent createEvent(GymEventRequest req) {
        GymEvent event = new GymEvent();
        mapRequest(req, event);
        return eventRepo.save(event);
    }

    @Override
    public GymEvent updateEvent(Long id, GymEventRequest req) {
        GymEvent event = getEventById(id);
        mapRequest(req, event);
        return eventRepo.save(event);
    }

    @Override
    public EventRegistration registerForEvent(Long eventId, EventRegistrationRequest request) {
        GymEvent event = getEventById(eventId);

        if (Boolean.FALSE.equals(event.getIsActive())) {
            throw new RuntimeException("Event is not active");
        }

        Integer current = event.getCurrentRegistrations() == null ? 0 : event.getCurrentRegistrations();
        Integer max = event.getMaxParticipants();
        if (max != null && current >= max) {
            throw new RuntimeException("Event is full");
        }

        // Save registration record
        EventRegistration reg = new EventRegistration();
        reg.setEventId(eventId);
        reg.setBookerId(request != null ? request.getBookerId() : null);
        reg.setBookerType(request != null && request.getBookerType() != null ? request.getBookerType() : "WALK_IN");
        reg.setBookerName(request != null && request.getBookerName() != null ? request.getBookerName() : "Unknown");
        reg.setBookerPhone(request != null ? request.getBookerPhone() : null);
        reg.setBookerEmail(request != null ? request.getBookerEmail() : null);
        EventRegistration saved = registrationRepo.save(reg);

        // Increment counter on event
        event.setCurrentRegistrations(current + 1);
        eventRepo.save(event);

        return saved;
    }

    @Override
    public List<EventRegistration> getRegistrations(Long eventId) {
        getEventById(eventId); // validates event exists
        return registrationRepo.findByEventIdOrderByRegisteredAtDesc(eventId);
    }

    @Override
    public void deleteEvent(Long id) {
        GymEvent event = getEventById(id);
        event.setIsActive(false);
        eventRepo.save(event);
    }

    private void mapRequest(GymEventRequest req, GymEvent event) {
        event.setTitle(req.getTitle());
        event.setDescription(req.getDescription());
        event.setEventType(req.getEventType());
        event.setEventDate(req.getEventDate());
        event.setTimeSlot(req.getTimeSlot());
        event.setVenue(req.getVenue());
        event.setPrice(req.getPrice());
        event.setMaxParticipants(req.getMaxParticipants());
        event.setImageUrl(req.getImageUrl());
    }
}
