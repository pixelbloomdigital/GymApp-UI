package com.pixelbloom.authLogin.requestdto;

import lombok.Data;

@Data
public class PaymentCallbackRequest {
    private String orderNumber;    // e.g. ORD-20260320-456
    private String status;         // SUCCESS | FAILED
    private String transactionId;  // e.g. TXN-123456
    private double amount;
}
