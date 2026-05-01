package com.pixelbloom.coreService.requestDto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BleSignalRequest {
    private Long memberId;
    private Long batchId;
    private LocalDate date;
    private LocalDateTime signalTime;
    private String beaconId;
    private Integer rssi;
}
