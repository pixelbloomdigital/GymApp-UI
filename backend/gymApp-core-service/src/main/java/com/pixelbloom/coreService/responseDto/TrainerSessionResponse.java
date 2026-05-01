package com.pixelbloom.coreService.responseDto;

import com.pixelbloom.coreService.enums.BatchType;
import com.pixelbloom.coreService.enums.TrainerSessionStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class TrainerSessionResponse {
    private Long sessionId;
    private Long trainerId;
    private Long batchId;
    private String batchName;
    private BatchType batchType;
    private LocalDate date;
    private LocalTime sessionStartTime;
    private LocalTime sessionEndTime;
    private Double hoursWorked;
    private BigDecimal ratePerHour;
    private BigDecimal sessionEarnings;
    private TrainerSessionStatus status;
    private Long substituteTrainerId;
    private String notes;
    private LocalDateTime createdAt;
}
