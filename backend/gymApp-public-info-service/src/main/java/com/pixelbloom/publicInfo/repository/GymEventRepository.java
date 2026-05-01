package com.pixelbloom.publicInfo.repository;

import com.pixelbloom.publicInfo.entity.GymEvent;
import com.pixelbloom.publicInfo.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GymEventRepository extends JpaRepository<GymEvent, Long> {
    List<GymEvent> findByIsActiveTrueOrderByEventDateAsc();
    List<GymEvent> findByEventTypeAndIsActiveTrue(EventType eventType);
}
