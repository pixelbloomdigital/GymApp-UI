package com.pixelbloom.publicInfo.dto;

import com.pixelbloom.publicInfo.enums.CostumeCategory;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostumeRequest {
    private String name;
    private String description;
    private CostumeCategory category;
    private String size;
    private BigDecimal rentalPrice;
    private Integer totalQuantity;
    private String imageUrl;
}
