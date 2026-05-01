package com.pixelbloom.authLogin.service;

import java.util.List;
import java.util.Map;

import com.pixelbloom.authLogin.requestdto.BookDemoResponse;
import com.pixelbloom.authLogin.requestdto.PaymentCallbackRequest;
import com.pixelbloom.authLogin.responsedto.BookDemoRequest;

public interface DemoBookingService {

    BookDemoResponse initiateBooking(BookDemoRequest request);
    Map<String, String> handlePaymentCallback(PaymentCallbackRequest callback);
    List<?> getAvailableSlots();
    Map<String, Object> createFreeDemoBooking(BookDemoRequest request);

    // Admin endpoints
    List<?> getAllBookings();
    Map<String, Long> getBookingStats();
    Map<String, String> confirmDemoDate(Long bookingId, String date);
    void cancelBooking(Long bookingId);
    List<?> getBookingsByVisitor(Long visitorId);
}
