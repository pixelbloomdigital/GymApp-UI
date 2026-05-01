package com.pixelbloom.authLogin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pixelbloom.authLogin.enums.MemberStatus;
import com.pixelbloom.authLogin.requestdto.AdminRegisterRequest;
import com.pixelbloom.authLogin.requestdto.CreateMemberRequest;
import com.pixelbloom.authLogin.requestdto.MemberRegisterRequest;
import com.pixelbloom.authLogin.requestdto.TrainerRegisterRequest;
import com.pixelbloom.authLogin.requestdto.VisitorRegisterRequest;
import com.pixelbloom.authLogin.responsedto.CreateMemberResponse;
import com.pixelbloom.authLogin.responsedto.MemberResponse;
import com.pixelbloom.authLogin.responsedto.VisitorRegisterResponse;
import com.pixelbloom.authLogin.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class RegistrationController {

    private final AuthService service;

    /** Public — visitor self-registers from the gym portal */
    @PostMapping("/visitor/register")
    public VisitorRegisterResponse registerVisitor(@Valid @RequestBody VisitorRegisterRequest request) {
        return service.registerVisitor(request);
    }

    /** Admin self-registration (first-time setup) */
    @PostMapping("/admin/register")
    public ResponseEntity<String> registerAdmin(@RequestBody AdminRegisterRequest request) {
        service.registerAdmin(request);
        return ResponseEntity.ok("Admin registered successfully");
    }

    /** Admin creates a Member login account with a password. */
    @PostMapping("/admin/register-member")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> registerMember(@Valid @RequestBody MemberRegisterRequest request) {
        service.registerMember(request);
        return ResponseEntity.ok("Member registered successfully");
    }

    /** Admin registers a Trainer — returns memberId so frontend can assign batch/payrate */
    @PostMapping("/admin/register-trainer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> registerTrainer(@RequestBody TrainerRegisterRequest request) {
        Long memberId = service.registerTrainer(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Trainer registered successfully", "memberId", memberId));
    }

    /**
     * Admin converts a Visitor to a Member after they complete in-gym registration.
     */
    @PostMapping("/convert-to-member")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<CreateMemberResponse> convertToMember(@RequestBody CreateMemberRequest request) {
        CreateMemberResponse response = service.convertVisitorToMember(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Admin changes a member's role (e.g. VISITOR → MEMBER).
     * Also assigns a membership plan if planId provided.
     */
    @PatchMapping("/members/{memberId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, String>> changeRole(
            @PathVariable Long memberId,
            @RequestParam String role,
            @RequestParam(required = false) Long visitorId) {
        service.changeMemberRole(memberId, com.pixelbloom.authLogin.enums.Role.valueOf(role.toUpperCase()), visitorId);
        return ResponseEntity.ok(java.util.Map.of("message", "Role updated to " + role));
    }

    @GetMapping("/members/by-visitor/{visitorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Long>> getMemberIdByVisitorId(@PathVariable Long visitorId) {
        Long memberId = service.getMemberIdByVisitorId(visitorId);
        return ResponseEntity.ok(java.util.Map.of("memberId", memberId));
    }

    @GetMapping("/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MemberResponse>> getAllMembers(@RequestParam String role) {
        com.pixelbloom.authLogin.enums.Role r = com.pixelbloom.authLogin.enums.Role.valueOf(role.toUpperCase());
        return ResponseEntity.ok(service.getAllMembersWithRole(r));
    }

    /**
     * Internal endpoint — called by gymApp-core-service only.
     * Activates (or suspends) a member after membership payment is confirmed.
     * Secured: only ADMIN role or internal service token should call this.
     */
    @PatchMapping("/members/{memberId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateMemberStatus(
            @PathVariable Long memberId,
            @RequestParam MemberStatus status) {
        service.updateMemberStatus(memberId, status);
        return ResponseEntity.ok("Member " + memberId + " status updated to " + status);
    }

    // Demo booking moved to DemoBookingController → POST /api/demo/book


}
