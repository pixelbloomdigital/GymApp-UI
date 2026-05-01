package com.pixelbloom.authLogin.entity;

import com.pixelbloom.authLogin.enums.DemoBookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor @NoArgsConstructor
public class DemoBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    private Long visitorId;
    private Long slotId;

    /** Unique order number sent to payment gateway e.g. ORD-20260320-456 */
    @Column(unique = true)
    private String orderNumber;

    private double originalAmount;   // always 99.0 (or 0 if admin sets free)
    private double discountApplied;  // amount reduced by coupon
    private double finalAmount;      // amount actually charged

    private String couponUsed;       // coupon code if applied

    /** Payment gateway transaction ID — set on webhook callback */
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DemoBookingStatus status = DemoBookingStatus.PENDING_PAYMENT;

    @CreationTimestamp
    private LocalDateTime bookedAt;

    private LocalDateTime confirmedAt;
}
