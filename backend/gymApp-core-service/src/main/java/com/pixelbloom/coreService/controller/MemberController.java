package com.pixelbloom.coreService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pixelbloom.coreService.requestDto.CreateCustomerRequest;
import com.pixelbloom.coreService.requestDto.UpdateCustomerRequest;
import com.pixelbloom.coreService.responseDto.CustomerResponse;
import com.pixelbloom.coreService.service.MemberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /** GET /api/members — Admin: list all members */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomerResponse>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }

    /** GET /api/members/{id} — Admin, member, trainer or visitor */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','VISITOR','TRAINER')")
    public ResponseEntity<CustomerResponse> getMember(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getCustomerById(id));
    }

    /** GET /api/members/by-email?email=member@example.com — Admin, member, trainer or visitor */
    @GetMapping("/by-email")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','VISITOR','TRAINER')")
    public ResponseEntity<CustomerResponse> getMemberByEmail(@RequestParam String email) {
        return ResponseEntity.ok(memberService.getCustomerByEmail(email));
    }

    /** POST /api/members — Admin creates a member record */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerResponse> createMember(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.status(201).body(memberService.createCustomer(request));
    }

    /** PUT /api/members/{id} — Admin, member, trainer or visitor updates profile */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','VISITOR','TRAINER')")
    public ResponseEntity<CustomerResponse> updateMember(@PathVariable Long id,
                                                          @Valid @RequestBody UpdateCustomerRequest request) {
        return ResponseEntity.ok(memberService.updateCustomer(id, request));
    }

    /** DELETE /api/members/{id} — Admin only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/members/internal/{id}
     * Internal-only endpoint for service-to-service calls (e.g. email-service).
     * No JWT required — protected by network + X-Internal-Service header.
     */
    @GetMapping("/internal/{id}")
    public ResponseEntity<CustomerResponse> getMemberInternal(
            @PathVariable Long id,
            @RequestHeader(value = "X-Internal-Service", required = false) String internalHeader) {
        if (!"email-service".equals(internalHeader)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(memberService.getCustomerById(id));
    }
}
