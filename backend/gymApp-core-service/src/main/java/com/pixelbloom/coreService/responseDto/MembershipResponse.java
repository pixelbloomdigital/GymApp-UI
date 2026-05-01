package com.pixelbloom.coreService.responseDto;

import com.pixelbloom.coreService.enums.MembershipStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MembershipResponse {
    private Long membershipId;
    private Long memberId;
    private String planName;
    private Integer durationMonths;
    private BigDecimal planPrice;
    private String batchName;
    private String batchTimeSlot;
    private LocalDate startDate;
    private LocalDate endDate;
    private MembershipStatus status;
    private Long daysRemaining;
    private BigDecimal paidAmount;
    private String paymentTransactionId;
    private String orderNumber;
    private LocalDateTime createdAt;
    // Returned on assign/renew — frontend uses to open Razorpay checkout
    private String paymentUrl;
}
