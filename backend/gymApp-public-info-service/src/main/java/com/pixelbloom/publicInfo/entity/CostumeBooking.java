package com.pixelbloom.publicInfo.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.pixelbloom.publicInfo.enums.BookingStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "costume_bookings")
@Data
public class CostumeBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long costumeId;

    // Booker identity — either a member or visitor
    private Long bookerId;
    private String bookerType;   // "MEMBER" or "VISITOR"
    private String bookerName;
    private String bookerPhone;
    private String bookerAddress;
    private String selectedSize;

    private LocalDate pickupDate;

    private LocalDate returnDate;

    private BigDecimal amountPaid;

    private String orderNumber;

    private String paymentTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BookingStatus status;  // PENDING_PAYMENT, CONFIRMED, PICKED_UP, RETURNED, CANCELLED

    // Pickup condition photo URL (uploaded by booker at pickup)
    private String pickupConditionImageUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
