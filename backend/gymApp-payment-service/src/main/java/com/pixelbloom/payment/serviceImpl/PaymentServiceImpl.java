package com.pixelbloom.payment.serviceImpl;

import com.pixelbloom.payment.config.RazorpayConfig;
import com.pixelbloom.payment.constants.PaymentStatus;
import com.pixelbloom.payment.constants.RefundStatus;
import com.pixelbloom.payment.entity.Income;
import com.pixelbloom.payment.entity.PaymentTransaction;
import com.pixelbloom.payment.entity.RefundTransaction;
import com.pixelbloom.payment.gateway.RazorpayGateway;
import com.pixelbloom.payment.repository.ExpenseRepository;
import com.pixelbloom.payment.repository.IncomeRepository;
import com.pixelbloom.payment.repository.PaymentRefundRepository;
import com.pixelbloom.payment.repository.PaymentTransactionRepository;
import com.pixelbloom.payment.requestDto.*;
import com.pixelbloom.payment.responseDto.*;
import com.pixelbloom.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentTransactionRepository paymentRepository;
    private final PaymentRefundRepository paymentRefundRepository;
    private final IncomeRepository incomeRepository;
    private final RestTemplate restTemplate;
    private final RazorpayGateway razorpayGateway;
    private final RazorpayConfig razorpayConfig;

    // ─── Create Order ────────────────────────────────────────────────────────

    @Override
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        // Save as PENDING
        PaymentTransaction txn = new PaymentTransaction();
        txn.setCustomerId(request.getCustomerId());
        txn.setOrderNumber(request.getOrderNumber());
        txn.setAmount(request.getAmount());
        txn.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        txn.setPaymentMethod(request.getPaymentMethod());
        txn.setPurpose(request.getPurpose());
        txn.setCallbackUrl(request.getCallbackUrl());
        txn.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(txn);

        // Create Razorpay order — returns razorpayOrderId
        String razorpayOrderId = razorpayGateway.createOrder(
                request.getOrderNumber(),
                request.getAmount(),
                txn.getCurrency());

        // Store razorpayOrderId as paymentTxnId for later verification
        txn.setPaymentTxnId(razorpayOrderId);
        paymentRepository.save(txn);

        log.info("Razorpay order created: {} → {}", request.getOrderNumber(), razorpayOrderId);

        // Return all details frontend needs to open Razorpay checkout
        String checkoutInfo = String.format(
                "razorpayOrderId=%s&keyId=%s&amount=%s&currency=%s",
                razorpayOrderId,
                razorpayConfig.getKeyId(),
                request.getAmount().multiply(BigDecimal.valueOf(100)).intValue(),
                txn.getCurrency());

        return new CreateOrderResponse(
                request.getOrderNumber(),
                "PENDING",
                checkoutInfo,
                "Use razorpayOrderId and keyId to open Razorpay checkout on frontend.");
    }

    // ─── Gateway Callback (webhook from Razorpay) ────────────────────────────

    @Override
    public Map<String, String> handleGatewayCallback(GatewayCallbackRequest callback) {
        PaymentTransaction txn = paymentRepository.findByOrderNumber(callback.getOrderNumber())
                .orElseThrow(() -> new RuntimeException(
                        "No transaction found for order: " + callback.getOrderNumber()));

        if (txn.getStatus() != PaymentStatus.PENDING) {
            return Map.of("message", "Already processed. Status: " + txn.getStatus());
        }

        if ("SUCCESS".equalsIgnoreCase(callback.getStatus())) {
            txn.setStatus(PaymentStatus.SUCCESS);
            txn.setPaymentTxnId(callback.getTransactionId());
            paymentRepository.save(txn);
            autoRecordIncome(txn);
        } else {
            txn.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(txn);
        }

        if (txn.getCallbackUrl() != null) {
            notifyCaller(txn, callback);
        }

        log.info("Callback processed: order={} status={}", callback.getOrderNumber(), txn.getStatus());
        return Map.of(
                "orderNumber",   callback.getOrderNumber(),
                "status",        txn.getStatus().name(),
                "transactionId", callback.getTransactionId() != null ? callback.getTransactionId() : "");
    }

    private void autoRecordIncome(PaymentTransaction txn) {
        try {
            String topic = txn.getPurpose() != null ? txn.getPurpose().name() : "OTHER";
            Income income = Income.builder()
                    .topic(topic)
                    .description("Payment received for " + topic)
                    .amount(txn.getAmount())
                    .customerId(txn.getCustomerId())
                    .orderNumber(txn.getOrderNumber())
                    .incomeDate(LocalDate.now())
                    .build();
            incomeRepository.save(income);
            log.info("Income auto-recorded for order={} amount={} topic={}", txn.getOrderNumber(), txn.getAmount(), topic);
        } catch (Exception e) {
            log.error("Failed to auto-record income for order={}: {}", txn.getOrderNumber(), e.getMessage());
        }
    }

    private void notifyCaller(PaymentTransaction txn, GatewayCallbackRequest callback) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                    "orderNumber",   txn.getOrderNumber(),
                    "status",        txn.getStatus().name(),
                    "transactionId", callback.getTransactionId() != null ? callback.getTransactionId() : "",
                    "amount",        txn.getAmount().doubleValue()
            );
            restTemplate.postForEntity(txn.getCallbackUrl(), new HttpEntity<>(body, headers), String.class);
            log.info("Notified caller at {} for order {}", txn.getCallbackUrl(), txn.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to notify caller at {}: {}", txn.getCallbackUrl(), e.getMessage());
        }
    }

    // ─── Direct Payment ──────────────────────────────────────────────────────

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        PaymentTransaction txn = new PaymentTransaction();
        txn.setOrderNumber(request.getOrderNumber());
        txn.setAmount(request.getAmount());
        txn.setCurrency(request.getCurrency());
        txn.setPaymentMethod(request.getPaymentMethod());
        txn.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(txn);

        String razorpayOrderId = razorpayGateway.createOrder(
                request.getOrderNumber(), request.getAmount(), request.getCurrency());

        PaymentResponse response = new PaymentResponse();
        response.setSuccess(true);
        response.setTransactionId(razorpayOrderId);
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }

    // ─── Refund ──────────────────────────────────────────────────────────────

    @Override
    public RefundResponse processRefundPayment(RefundRequest request) {
        PaymentTransaction payment = paymentRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            return new RefundResponse(false, request.getOrderNumber(), "Already refunded");
        }

        RefundTransaction refund = paymentRefundRepository.save(
                RefundTransaction.builder()
                        .orderNumber(request.getOrderNumber())
                        .refundTxnId(payment.getPaymentTxnId())
                        .refundAmount(payment.getAmount())
                        .refundReason(request.getRefundReason())
                        .refundStatus(RefundStatus.INITIATED)
                        .refundedAt(LocalDateTime.now())
                        .build()
        );

        // TODO: Razorpay refund API — use RazorpayClient.payments.refund(paymentId, options)
        String gatewayTxnId = UUID.randomUUID().toString();

        refund.setRefundStatus(RefundStatus.SUCCESS);
        refund.setRefundTxnId(gatewayTxnId);
        paymentRefundRepository.save(refund);

        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        return new RefundResponse(request.getOrderNumber(), request.getRefundAmount(),
                request.getCurrency(), refund.getRefundStatus(), gatewayTxnId,
                request.getPaymentSource(), refund.getRefundedAt(), "Refund successful");
    }
}
