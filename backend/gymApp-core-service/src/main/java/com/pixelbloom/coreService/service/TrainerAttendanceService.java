package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.model.attendanceModel.BatchPayRate;
import com.pixelbloom.coreService.requestDto.BatchPayRateRequest;
import com.pixelbloom.coreService.requestDto.MarkTrainerSessionRequest;
import com.pixelbloom.coreService.requestDto.StartSessionRequest;
import com.pixelbloom.coreService.responseDto.SessionSummaryResponse;
import com.pixelbloom.coreService.responseDto.TrainerMonthlySummary;
import com.pixelbloom.coreService.responseDto.TrainerSessionResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

public interface TrainerAttendanceService {

    TrainerSessionResponse startSession(StartSessionRequest request);

    SessionSummaryResponse endSession(Long sessionId, LocalTime endTime);

    TrainerSessionResponse markSession(MarkTrainerSessionRequest request);

    TrainerSessionResponse cancelSession(Long sessionId, String reason, Long substituteTrainerId);

    List<TrainerSessionResponse> getTrainerSessions(Long trainerId, LocalDate from, LocalDate to);

    TrainerMonthlySummary getTrainerMonthlySummary(Long trainerId, YearMonth yearMonth);

    // Pay rate management
    BatchPayRate createPayRate(BatchPayRateRequest request);
    BatchPayRate updatePayRate(Long id, BatchPayRateRequest request);
    List<BatchPayRate> getAllPayRates();
}
