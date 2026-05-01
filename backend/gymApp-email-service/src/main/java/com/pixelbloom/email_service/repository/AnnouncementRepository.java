package com.pixelbloom.email_service.repository;

import com.pixelbloom.email_service.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByIsActiveTrueAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);
}
