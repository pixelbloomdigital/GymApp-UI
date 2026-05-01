package com.pixelbloom.authLogin.requestdto;


import lombok.*;

@Getter @Setter
@AllArgsConstructor
public class BookDemoResponse {
    private Long visitorId;
    private String batchType;
    private String slotType;
    private String timeSlot;
    private double originalAmount;
    private double discountApplied;
    private double finalAmount;
    private String couponUsed;
    private String message;
}
