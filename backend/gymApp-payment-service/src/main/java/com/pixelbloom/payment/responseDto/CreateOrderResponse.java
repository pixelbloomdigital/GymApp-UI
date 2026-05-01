package com.pixelbloom.payment.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrderResponse {
    private String orderNumber;
    private String status;          // PENDING
    private String paymentUrl;      // gateway URL frontend redirects to
    private String message;
}
