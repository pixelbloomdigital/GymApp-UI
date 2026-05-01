package com.pixelbloom.publicInfo.dto;

import com.pixelbloom.publicInfo.enums.EventType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GymEventRequest {
    private String title;
    private String description;
    private EventType eventType;
    private LocalDate eventDate;
    private String timeSlot;
    private String venue;
    private BigDecimal price;
    private Integer maxParticipants;
    private String imageUrl;
}
