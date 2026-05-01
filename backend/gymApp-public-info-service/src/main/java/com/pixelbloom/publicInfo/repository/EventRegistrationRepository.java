package com.pixelbloom.publicInfo.repository;

import com.pixelbloom.publicInfo.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByEventIdOrderByRegisteredAtDesc(Long eventId);
    long countByEventId(Long eventId);
    boolean existsByEventIdAndBookerId(Long eventId, Long bookerId);
}
