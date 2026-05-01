package com.pixelbloom.coreService.requestDto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentCallbackRequest {
    private String orderNumber;
    private String status;           // SUCCESS or FAILED
    private String transactionId;
    private BigDecimal amount;
}
