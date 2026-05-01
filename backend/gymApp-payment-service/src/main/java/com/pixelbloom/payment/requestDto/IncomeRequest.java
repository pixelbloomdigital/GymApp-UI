package com.pixelbloom.payment.requestDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class IncomeRequest {

    @NotBlank
    private String topic;           // MEMBERSHIP, DEMO_BOOKING, DIET_PLAN, etc.

    @NotBlank
    private String description;

    @NotNull
    @Positive
    private BigDecimal amount;

    private Long customerId;

    private String orderNumber;

    @NotNull
    private LocalDate incomeDate;
}
