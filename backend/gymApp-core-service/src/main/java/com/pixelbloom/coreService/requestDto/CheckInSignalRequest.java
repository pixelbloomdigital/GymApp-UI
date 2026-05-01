package com.pixelbloom.coreService.requestDto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CheckInSignalRequest {
    private Long memberId;
    private Long batchId;
    private LocalDate date;
    private LocalDateTime signalTime;
}
