package com.pixelbloom.coreService.responseDto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MembershipPlanResponse {
    private Long id;
    private String name;
    private String description;
    private Integer durationMonths;
    private BigDecimal price;
    private Integer daysPerWeek;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
