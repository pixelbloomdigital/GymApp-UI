package com.pixelbloom.authLogin.enums;

public enum DemoBookingStatus {
    PENDING_PAYMENT,   // booking initiated, awaiting payment
    CONFIRMED,         // payment successful
    FREE,              // coupon made it 100% free — no payment needed
    CANCELLED,         // visitor cancelled or payment failed
    EXPIRED            // slot expired without payment
}
