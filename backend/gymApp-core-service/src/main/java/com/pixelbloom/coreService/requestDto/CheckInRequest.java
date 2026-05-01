package com.pixelbloom.coreService.requestDto;

import lombok.Data;

@Data
public class CheckInRequest {
    private Long memberId;
    private Long batchId;
    private String timeSlot;
}
