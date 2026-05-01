package com.pixelbloom.publicInfo.controller;

import com.pixelbloom.publicInfo.dto.EventRegistrationRequest;
import com.pixelbloom.publicInfo.dto.GymEventRequest;
import com.pixelbloom.publicInfo.entity.EventRegistration;
import com.pixelbloom.publicInfo.entity.GymEvent;
import com.pixelbloom.publicInfo.enums.EventType;
import com.pixelbloom.publicInfo.service.GymEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/events")
@RequiredArgsConstructor
public class GymEventController {

    private final GymEventService eventService;

    @GetMapping
    public ResponseEntity<List<GymEvent>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllActiveEvents());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<GymEvent>> getByType(@PathVariable EventType type) {
        return ResponseEntity.ok(eventService.getEventsByType(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GymEvent> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GymEvent> createEvent(@RequestBody GymEventRequest request) {
        return ResponseEntity.ok(eventService.createEvent(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GymEvent> updateEvent(@PathVariable Long id, @RequestBody GymEventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(id, request));
    }

    /** Register for an event — open to all authenticated users (member, visitor, trainer) */
    @PostMapping("/{id}/register")
    public ResponseEntity<EventRegistration> registerEvent(
            @PathVariable Long id,
            @RequestBody(required = false) EventRegistrationRequest request) {
        return ResponseEntity.ok(eventService.registerForEvent(id, request));
    }

    /** Admin: get all registrations for a specific event */
    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EventRegistration>> getRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getRegistrations(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
