package com.pixelbloom.coreService.requestDto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateGoalRequest {
    private String goalDescription;
    private LocalDate targetDate;
}
