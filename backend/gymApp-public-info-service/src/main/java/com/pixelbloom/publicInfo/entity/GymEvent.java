package com.pixelbloom.publicInfo.entity;

import com.pixelbloom.publicInfo.enums.EventType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gym_events")
@Data
public class GymEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private EventType eventType;   // WORKSHOP, COMPETITION, SPECIAL_CLASS, DANDIYA, GARBA, WEDDING_CHOREOGRAPHY

    private LocalDate eventDate;

    private String timeSlot;       // e.g. "6:00PM - 9:00PM"

    private String venue;

    private BigDecimal price;      // 0 = free

    private Integer maxParticipants;

    private Integer currentRegistrations = 0;

    private String imageUrl;

    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
