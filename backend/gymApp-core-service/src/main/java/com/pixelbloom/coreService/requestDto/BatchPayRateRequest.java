package com.pixelbloom.coreService.requestDto;

import com.pixelbloom.coreService.enums.BatchType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BatchPayRateRequest {
    private BatchType batchType;
    private Long batchId;       // null = all batches of this type
    private Long trainerId;     // null = all trainers
    private BigDecimal ratePerHour;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
