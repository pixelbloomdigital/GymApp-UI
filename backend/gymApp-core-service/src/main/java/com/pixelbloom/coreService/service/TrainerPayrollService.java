package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.responseDto.TrainerPayrollResponse;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

public interface TrainerPayrollService {

    List<TrainerPayrollResponse> generateMonthlyPayroll(YearMonth yearMonth, Long trainerId);

    List<TrainerPayrollResponse> getPayrollByMonth(YearMonth yearMonth);

    TrainerPayrollResponse getTrainerPayroll(Long trainerId, YearMonth yearMonth);

    TrainerPayrollResponse approvePayroll(Long payrollId, Long approvedBy);

    TrainerPayrollResponse markAsPaid(Long payrollId, LocalDate paidOn, String paymentReference);
}
