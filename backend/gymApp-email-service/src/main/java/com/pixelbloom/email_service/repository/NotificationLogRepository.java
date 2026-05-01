package com.pixelbloom.email_service.repository;

import com.pixelbloom.email_service.enums.NotificationStatus;
import com.pixelbloom.email_service.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    /** Returns all FAILED records that haven't exceeded max retries */
    List<NotificationLog> findByStatusAndAttemptCountLessThan(NotificationStatus status, int maxAttempts);
}
