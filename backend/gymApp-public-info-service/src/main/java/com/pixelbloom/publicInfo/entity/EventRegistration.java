package com.pixelbloom.publicInfo.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations")
@Data
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId;

    private Long bookerId;        // memberId or visitorId — nullable for walk-ins

    private String bookerType;    // MEMBER, VISITOR, WALK_IN

    @Column(nullable = false)
    private String bookerName;

    private String bookerPhone;

    private String bookerEmail;

    @CreationTimestamp
    private LocalDateTime registeredAt;
}
