package com.pixelbloom.payment.responseDto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private String topic;
    private String description;
    private BigDecimal amount;
    private String paidTo;
    private Long equipmentId;
    private LocalDate expenseDate;
    private String recordedBy;
    private LocalDateTime createdAt;
}
