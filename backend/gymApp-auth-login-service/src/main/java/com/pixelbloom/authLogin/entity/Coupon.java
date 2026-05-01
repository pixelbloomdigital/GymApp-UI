package com.pixelbloom.authLogin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor @NoArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long couponId;

    @Column(unique = true, nullable = false)
    private String code;

    // FLAT = fixed Rs off, PERCENT = percentage off
    private String discountType; // "FLAT" or "PERCENT"

    private Double discountValue; // e.g. 99.0 for FLAT, 50.0 for 50%

    private boolean active = true;
}
