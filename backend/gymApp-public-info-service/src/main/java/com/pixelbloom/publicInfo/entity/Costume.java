package com.pixelbloom.publicInfo.entity;

import com.pixelbloom.publicInfo.enums.CostumeCategory;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "costumes")
@Data
public class Costume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private CostumeCategory category;  // DANDIYA, GARBA, WEDDING, ZUMBA, GENERAL

    private String size;               // S, M, L, XL, XXL or free text

    private BigDecimal rentalPrice;    // per booking

    private Integer totalQuantity;

    private Integer availableQuantity;

    private String imageUrl;

    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
