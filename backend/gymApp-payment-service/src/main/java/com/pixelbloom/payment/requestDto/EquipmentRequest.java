package com.pixelbloom.payment.requestDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EquipmentRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private Integer quantity;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotBlank
    private String vendor;

    private String address;

    private String contact;

    @NotNull
    private LocalDate purchasedDate;

    private String recordedBy;
}