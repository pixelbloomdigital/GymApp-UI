package com.pixelbloom.email_service.model;

import com.pixelbloom.email_service.enums.NotificationStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_log")
@Data
@NoArgsConstructor
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long   memberId;
    private String memberPhone;

    /** e.g. "WHATSAPP" */
    private String channel;

    /** e.g. "DAILY_PROGRESS" */
    private String eventType;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status;   // PENDING, SENT, FAILED

    private int    attemptCount;
    private String errorMessage;

    /** The raw message body that was (or will be) sent */
    @Column(columnDefinition = "TEXT")
    private String messageBody;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime lastAttemptedAt;
}
