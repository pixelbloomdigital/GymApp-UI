package com.pixelbloom.payment.responseDto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class EquipmentResponse {
    private Long id;
    private String name;
    private String description;
    private Integer quantity;
    private BigDecimal amount;
    private String vendor;
    private String address;
    private String contact;
    private LocalDate purchasedDate;
    private Long expenseId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}