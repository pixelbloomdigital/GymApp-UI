package com.pixelbloom.authLogin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pixelbloom.authLogin.entity.VisitorNotification;

public interface VisitorNotificationRepository extends JpaRepository<VisitorNotification, Long> {
    List<VisitorNotification> findByVisitorIdOrderByCreatedAtDesc(Long visitorId);
}
