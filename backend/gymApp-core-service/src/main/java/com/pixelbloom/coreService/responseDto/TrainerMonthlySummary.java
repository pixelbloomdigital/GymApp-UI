package com.pixelbloom.coreService.responseDto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TrainerMonthlySummary {
    private Long trainerId;
    private String yearMonth;
    private int totalSessionsConducted;
    private int totalSessionsCancelled;
    private double totalHoursWorked;
    private BigDecimal totalEarnings;
    private List<BatchBreakdown> batchBreakdown;
    private List<TrainerSessionResponse> sessions;

    @Data
    public static class BatchBreakdown {
        private String batchType;
        private String batchName;
        private int sessionsCompleted;
        private double totalHours;
        private BigDecimal ratePerHour;
        private BigDecimal totalEarnings;
    }
}
