package com.pixelbloom.coreService.responseDto;

import com.pixelbloom.coreService.enums.PayrollStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class TrainerPayrollResponse {
    private Long payrollId;
    private Long trainerId;
    private String payrollMonth;
    private double totalHoursWorked;
    private int totalSessionsConducted;
    private int totalSessionsCancelled;
    private BigDecimal totalEarnings;
    private PayrollStatus status;
    private LocalDate paidOn;
    private String paymentReference;
    private Long approvedBy;
    private List<TrainerMonthlySummary.BatchBreakdown> batchBreakdown;
}
