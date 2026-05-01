package com.pixelbloom.publicInfo.controller;

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

import com.pixelbloom.publicInfo.dto.CostumeBookingRequest;
import com.pixelbloom.publicInfo.dto.CostumeRequest;
import com.pixelbloom.publicInfo.dto.PaymentCallbackRequest;
import com.pixelbloom.publicInfo.entity.Costume;
import com.pixelbloom.publicInfo.entity.CostumeBooking;
import com.pixelbloom.publicInfo.enums.CostumeCategory;
import com.pixelbloom.publicInfo.service.CostumeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/costumes")
@RequiredArgsConstructor
public class CostumeController {

    private final CostumeService costumeService;

    // ─── Public reads ─────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Costume>> getAllCostumes() {
        return ResponseEntity.ok(costumeService.getAllActiveCostumes());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Costume>> getByCategory(@PathVariable CostumeCategory category) {
        return ResponseEntity.ok(costumeService.getCostumesByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Costume> getById(@PathVariable Long id) {
        return ResponseEntity.ok(costumeService.getCostumeById(id));
    }

    // ─── Admin CRUD ───────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Costume> createCostume(@RequestBody CostumeRequest request) {
        return ResponseEntity.ok(costumeService.createCostume(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Costume> updateCostume(@PathVariable Long id, @RequestBody CostumeRequest request) {
        return ResponseEntity.ok(costumeService.updateCostume(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCostume(@PathVariable Long id) {
        costumeService.deleteCostume(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Booking ──────────────────────────────────────────────────────────────

    /** Authenticated users (MEMBER or VISITOR) can book */
    @PostMapping("/book")
    public ResponseEntity<CostumeBooking> bookCostume(@RequestBody CostumeBookingRequest request) {
        return ResponseEntity.ok(costumeService.initiateBooking(request));
    }

    /** Payment callback from payment-service */
    @PostMapping("/payment-callback")
    public ResponseEntity<Map<String, String>> paymentCallback(@RequestBody PaymentCallbackRequest callback) {
        return ResponseEntity.ok(costumeService.handlePaymentCallback(callback));
    }

    /** Confirm pickup — admin/trainer records condition photo */
    @PostMapping("/book/{bookingId}/pickup")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<CostumeBooking> confirmPickup(
            @PathVariable Long bookingId,
            @RequestParam String conditionImageUrl) {
        return ResponseEntity.ok(costumeService.confirmPickup(bookingId, conditionImageUrl));
    }

    /** Confirm return — admin/trainer */
    @PostMapping("/book/{bookingId}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<CostumeBooking> confirmReturn(@PathVariable Long bookingId) {
        return ResponseEntity.ok(costumeService.confirmReturn(bookingId));
    }

    /** Booker views their own bookings */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<CostumeBooking>> myBookings(
            @RequestParam Long bookerId,
            @RequestParam String bookerType) {
        return ResponseEntity.ok(costumeService.getBookingsByBooker(bookerId, bookerType));
    }

    /** Admin views all costume bookings */
    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CostumeBooking>> allBookings() {
        return ResponseEntity.ok(costumeService.getAllBookings());
    }
}
