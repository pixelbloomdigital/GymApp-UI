package com.pixelbloom.coreService.requestDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePlanRequest {
    @NotBlank
    private String name;
    private String description;
    @NotNull @Positive
    private Integer durationMonths;
    @NotNull @Positive
    private BigDecimal price;
    @NotNull @Positive
    private Integer daysPerWeek;
}
