package com.pixelbloom.coreService.requestDto;

import com.pixelbloom.coreService.enums.TrainerSessionStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class MarkTrainerSessionRequest {
    private Long trainerId;
    private Long batchId;
    private LocalDate date;
    private LocalTime sessionStartTime;
    private LocalTime sessionEndTime;
    private TrainerSessionStatus status;
    private String notes;
}
