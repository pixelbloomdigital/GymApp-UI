package com.pixelbloom.payment.entity;

import com.pixelbloom.payment.constants.PaymentPurpose;
import com.pixelbloom.payment.constants.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Data
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private String orderNumber;

    private BigDecimal amount;
    private String currency;
    private String paymentMethod; // UPI, CARD

    private String paymentTxnId;

    /** What this payment is for — DEMO_BOOKING, MEMBERSHIP, etc. */
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentPurpose purpose;

    /**
     * URL the payment-service will POST the callback to after gateway confirms.
     * e.g. http://localhost:2000/api/demo/payments/callback
     */
    @Column(length = 500)
    private String callbackUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}