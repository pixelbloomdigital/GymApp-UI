package com.pixelbloom.publicInfo.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class CostumeBookingRequest {
    private Long costumeId;
    private Long bookerId;
    private String bookerType;   // "MEMBER", "VISITOR", or "TRAINER"
    private String bookerName;
    private String bookerPhone;
    private String bookerAddress;
    private String selectedSize;
    private LocalDate pickupDate;
    private LocalDate returnDate;
}
