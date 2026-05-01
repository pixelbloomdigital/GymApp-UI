package com.pixelbloom.payment.requestDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {

    @NotBlank
    private String topic;           // SALARY, EQUIPMENT, MAINTENANCE, UTILITIES, etc.

    @NotBlank
    private String description;

    @NotNull
    @Positive
    private BigDecimal amount;

    private String paidTo;

    private Long equipmentId;

    @NotNull
    private LocalDate expenseDate;

    private String recordedBy;
}
