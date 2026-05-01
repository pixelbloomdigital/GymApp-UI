package com.pixelbloom.coreService.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pixelbloom.coreService.requestDto.AssignMembershipRequest;
import com.pixelbloom.coreService.requestDto.PaymentCallbackRequest;
import com.pixelbloom.coreService.requestDto.RenewMembershipRequest;
import com.pixelbloom.coreService.responseDto.MembershipResponse;
import com.pixelbloom.coreService.service.MembershipService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    /**
     * POST /api/memberships — Admin assigns membership to a member.
     * Returns paymentUrl (Razorpay checkout params) for the frontend.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<MembershipResponse> assignMembership(
            @Valid @RequestBody AssignMembershipRequest request) {
        return ResponseEntity.status(201).body(membershipService.assignMembership(request));
    }

    /**
     * GET /api/memberships/member/{memberId} — Member views their memberships.
     */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','VISITOR','TRAINER')")
    public ResponseEntity<List<MembershipResponse>> getMemberMemberships(@PathVariable Long memberId) {
        return ResponseEntity.ok(membershipService.getMemberMemberships(memberId));
    }

    /**
     * GET /api/memberships/{membershipId} — Get single membership details.
     */
    @GetMapping("/{membershipId}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<MembershipResponse> getMembership(@PathVariable Long membershipId) {
        return ResponseEntity.ok(membershipService.getMembershipById(membershipId));
    }

    /**
     * POST /api/memberships/{membershipId}/renew — Member or Admin renews membership.
     * Returns new paymentUrl for Razorpay checkout.
     */
    @PostMapping("/{membershipId}/renew")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<MembershipResponse> renewMembership(
            @PathVariable Long membershipId,
            @Valid @RequestBody RenewMembershipRequest request) {
        return ResponseEntity.status(201).body(membershipService.renewMembership(membershipId, request));
    }

    /**
     * DELETE /api/memberships/{membershipId} — Cancel membership.
     */
    @DeleteMapping("/{membershipId}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<MembershipResponse> cancelMembership(@PathVariable Long membershipId) {
        return ResponseEntity.ok(membershipService.cancelMembership(membershipId));
    }

    /**
     * POST /api/memberships/expire — Manually trigger expiry job (Admin/System).
     */
    @PostMapping("/expire")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> expireMemberships() {
        int count = membershipService.expireMemberships();
        return ResponseEntity.ok(Map.of("expiredCount", count));
    }

    /**
     * POST /api/memberships/{membershipId}/activate — Admin directly activates a membership (no payment required).
     * Used for cash payments, free trials, or admin override.
     */
    @PostMapping("/{membershipId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> activateMembership(@PathVariable Long membershipId) {
        return ResponseEntity.ok(membershipService.handlePaymentCallback(
            new com.pixelbloom.coreService.requestDto.PaymentCallbackRequest() {{
                setOrderNumber(membershipService.getMembershipById(membershipId).getOrderNumber());
                setStatus("SUCCESS");
                setTransactionId("ADMIN-DIRECT-" + System.currentTimeMillis());
                setAmount(java.math.BigDecimal.ZERO);
            }}
        ));
    }

    /**
     * POST /api/payments/callback — Called by payment-service after Razorpay confirms.
     * Activates the membership on SUCCESS.
     */
    @PostMapping("/payments/callback")
    public ResponseEntity<Map<String, String>> paymentCallback(
            @RequestBody PaymentCallbackRequest callback) {
        return ResponseEntity.ok(membershipService.handlePaymentCallback(callback));
    }
}
