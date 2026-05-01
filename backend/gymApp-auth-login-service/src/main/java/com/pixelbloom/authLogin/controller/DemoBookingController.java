package com.pixelbloom.authLogin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pixelbloom.authLogin.requestdto.BookDemoResponse;
import com.pixelbloom.authLogin.requestdto.PaymentCallbackRequest;
import com.pixelbloom.authLogin.responsedto.BookDemoRequest;
import com.pixelbloom.authLogin.service.DemoBookingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoBookingController {

    private final DemoBookingService demoBookingService;

    /**
     * Step 1 — Visitor initiates a demo booking.
     * Applies coupon if provided, calculates final amount.
     * If finalAmount == 0 → booking confirmed immediately (FREE).
     * If finalAmount > 0 → returns orderNumber for frontend to initiate payment.
     *
     * Auth: VISITOR
     */
    @PostMapping("/book")
    @PreAuthorize("hasRole('VISITOR')")
    public ResponseEntity<BookDemoResponse> bookDemo(@RequestBody BookDemoRequest request) {
        return ResponseEntity.ok(demoBookingService.initiateBooking(request));
    }

    /**
     * Step 2 — Payment gateway webhook.
     * Called by the payment gateway after the visitor completes payment.
     * Confirms or cancels the booking based on payment status.
     *
     * Auth: Public (called by payment gateway server, not by user)
     * Secure this with a webhook secret header in production.
     */
    @PostMapping("/payments/callback")
    public ResponseEntity<Map<String, String>> paymentCallback(
            @RequestBody PaymentCallbackRequest callback) {
        return ResponseEntity.ok(demoBookingService.handlePaymentCallback(callback));
    }

    /**
     * Get all available demo slots — public so visitors can browse before booking.
     */
    @GetMapping("/slots")
    public ResponseEntity<List<?>> getAvailableSlots() {
        return ResponseEntity.ok(demoBookingService.getAvailableSlots());
    }

    /**
     * Admin creates a demo booking directly for a visitor (FREE, no payment).
     * Used when admin onboards a visitor.
     */
    @PostMapping("/admin/create-booking")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDemoBookingAsAdmin(@RequestBody BookDemoRequest request) {
        return ResponseEntity.ok(demoBookingService.createFreeDemoBooking(request));
    }

    /** GET /api/demo/bookings — Admin: all bookings */
    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<?>> getAllBookings() {
        return ResponseEntity.ok(demoBookingService.getAllBookings());
    }

    /** GET /api/demo/bookings/stats — Admin: booking stats */
    @GetMapping("/bookings/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Long>> getBookingStats() {
        return ResponseEntity.ok(demoBookingService.getBookingStats());
    }

    /** PUT /api/demo/bookings/{bookingId}/confirm-date — Admin sets demo date */
    @PutMapping("/bookings/{bookingId}/confirm-date")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, String>> confirmDate(
            @PathVariable Long bookingId,
            @RequestParam String date) {
        return ResponseEntity.ok(demoBookingService.confirmDemoDate(bookingId, date));
    }

    /** DELETE /api/demo/bookings/{bookingId} — Admin cancels booking */
    @DeleteMapping("/bookings/{bookingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId) {
        demoBookingService.cancelBooking(bookingId);
        return ResponseEntity.noContent().build();
    }

    /** DELETE /api/demo/bookings/{bookingId}/visitor — Visitor cancels their own booking */
    @DeleteMapping("/bookings/{bookingId}/visitor")
    @PreAuthorize("hasRole('VISITOR')")
    public ResponseEntity<Void> cancelOwnBooking(@PathVariable Long bookingId) {
        demoBookingService.cancelBooking(bookingId);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/demo/bookings/visitor/{visitorId} — Visitor views their own bookings */
    @GetMapping("/bookings/visitor/{visitorId}")
    @PreAuthorize("hasRole('VISITOR')")
    public ResponseEntity<List<?>> getVisitorBookings(@PathVariable Long visitorId) {
        return ResponseEntity.ok(demoBookingService.getBookingsByVisitor(visitorId));
    }
}
