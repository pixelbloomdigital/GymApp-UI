package com.pixelbloom.payment.responseDto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class IncomeResponse {
    private Long id;
    private String topic;
    private String description;
    private BigDecimal amount;
    private Long customerId;
    private String orderNumber;
    private LocalDate incomeDate;
    private LocalDateTime createdAt;
}
