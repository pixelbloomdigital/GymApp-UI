package com.pixelbloom.coreService.model.membershipModel;

import com.pixelbloom.coreService.enums.MembershipStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "member_memberships")
@Data
public class MemberMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long memberId;

    private Long planId;

    private Long batchId;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private MembershipStatus status;

    private String orderNumber;

    private BigDecimal paidAmount;

    private String paymentTransactionId;

    private Long assignedBy;          // admin memberId

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
