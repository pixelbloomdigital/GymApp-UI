package com.pixelbloom.payment.service;

import com.pixelbloom.payment.requestDto.CreateOrderRequest;
import com.pixelbloom.payment.requestDto.GatewayCallbackRequest;
import com.pixelbloom.payment.requestDto.PaymentRequest;
import com.pixelbloom.payment.requestDto.RefundRequest;
import com.pixelbloom.payment.responseDto.CreateOrderResponse;
import com.pixelbloom.payment.responseDto.PaymentResponse;
import com.pixelbloom.payment.responseDto.RefundResponse;

import java.util.Map;

public interface PaymentService {

    /** Create a payment order — returns gateway URL for frontend to redirect to */
    CreateOrderResponse createOrder(CreateOrderRequest request);

    /** Gateway webhook — called by payment gateway after user pays */
    Map<String, String> handleGatewayCallback(GatewayCallbackRequest callback);

    /** Direct payment processing (internal use) */
    PaymentResponse processPayment(PaymentRequest request);

    /** Refund a payment */
    RefundResponse processRefundPayment(RefundRequest request);
}
