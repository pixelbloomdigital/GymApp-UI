package com.pixelbloom.payment.requestDto;

import lombok.Data;

@Data
public class GatewayCallbackRequest {
    private String orderNumber;
    private String status;         // SUCCESS | FAILED
    private String transactionId;  // gateway txn ID e.g. TXN-123456
    private double amount;
}
