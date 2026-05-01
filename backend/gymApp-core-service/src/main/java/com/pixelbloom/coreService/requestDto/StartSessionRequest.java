package com.pixelbloom.coreService.requestDto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class StartSessionRequest {
    private Long trainerId;
    private Long batchId;
    private LocalDate date;           // defaults to today if null
    private LocalTime sessionStartTime; // defaults to now() if null
}
