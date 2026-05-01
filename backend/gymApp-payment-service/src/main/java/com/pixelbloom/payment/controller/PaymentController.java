package com.pixelbloom.payment.controller;

import com.pixelbloom.payment.gateway.RazorpayGateway;
import com.pixelbloom.payment.requestDto.*;
import com.pixelbloom.payment.responseDto.*;
import com.pixelbloom.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final RazorpayGateway razorpayGateway;

    /**
     * Step 1 — Any service calls this to create a Razorpay order.
     * Returns: razorpayOrderId, keyId, amount (paise), currency
     * Frontend uses these to open Razorpay checkout.
     *
     * POST /api/payments/order
     */
    @PostMapping("/order")
    public ResponseEntity<CreateOrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }

    /**
     * Step 2a — Razorpay webhook (server-to-server).
     * Razorpay POSTs here after payment is captured.
     * Header: X-Razorpay-Signature
     *
     * POST /api/payments/razorpay/webhook
     */
    @PostMapping("/razorpay/webhook")
    public ResponseEntity<Map<String, String>> razorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        log.info("Razorpay webhook received");

        if (signature != null && !razorpayGateway.verifyWebhookSignature(payload, signature)) {
            log.warn("Razorpay webhook signature FAILED");
            return ResponseEntity.status(400).body(Map.of("error", "Invalid signature"));
        }

        // Parse orderNumber and status from webhook payload
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<?, ?> body = mapper.readValue(payload, Map.class);
            String event = (String) body.get("event"); // payment.captured or payment.failed

            Map<?, ?> payloadMap  = (Map<?, ?>) body.get("payload");
            Map<?, ?> paymentWrap = (Map<?, ?>) payloadMap.get("payment");
            Map<?, ?> entity      = (Map<?, ?>) paymentWrap.get("entity");

            String razorpayPaymentId = (String) entity.get("id");
            String razorpayOrderId   = (String) entity.get("order_id");
            String status            = "payment.captured".equals(event) ? "SUCCESS" : "FAILED";

            // Find our internal orderNumber by razorpayOrderId (stored as paymentTxnId)
            GatewayCallbackRequest callback = new GatewayCallbackRequest();
            callback.setOrderNumber(razorpayOrderId); // will be resolved in service
            callback.setStatus(status);
            callback.setTransactionId(razorpayPaymentId);

            return ResponseEntity.ok(paymentService.handleGatewayCallback(callback));
        } catch (Exception e) {
            log.error("Failed to parse Razorpay webhook: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", "Invalid webhook payload"));
        }
    }

    /**
     * Step 2b — Frontend payment verification (after Razorpay checkout completes).
     * Frontend sends: { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature }
     * Backend verifies signature and confirms payment.
     *
     * POST /api/payments/razorpay/verify
     */
    @PostMapping("/razorpay/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody Map<String, String> body) {
        String orderNumber       = body.get("orderNumber");
        String razorpayOrderId   = body.get("razorpayOrderId");
        String razorpayPaymentId = body.get("razorpayPaymentId");
        String signature         = body.get("razorpaySignature");

        boolean valid = razorpayGateway.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!valid) {
            log.warn("Razorpay payment signature invalid for order {}", orderNumber);
            return ResponseEntity.status(400).body(Map.of("error", "Invalid payment signature"));
        }

        GatewayCallbackRequest callback = new GatewayCallbackRequest();
        callback.setOrderNumber(orderNumber);
        callback.setStatus("SUCCESS");
        callback.setTransactionId(razorpayPaymentId);

        return ResponseEntity.ok(paymentService.handleGatewayCallback(callback));
    }

    /**
     * Internal callback — payment-service notifies originating services.
     * POST /api/payments/callback
     */
    @PostMapping("/callback")
    public ResponseEntity<Map<String, String>> internalCallback(
            @RequestBody GatewayCallbackRequest callback) {
        return ResponseEntity.ok(paymentService.handleGatewayCallback(callback));
    }

    @PostMapping("/pay")
    public ResponseEntity<PaymentResponse> pay(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    @PostMapping("/refund")
    public ResponseEntity<RefundResponse> refund(@RequestBody RefundRequest request) {
        return ResponseEntity.ok(paymentService.processRefundPayment(request));
    }
}
