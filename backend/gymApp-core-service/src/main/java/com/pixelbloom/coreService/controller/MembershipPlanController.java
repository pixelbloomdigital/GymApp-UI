package com.pixelbloom.coreService.controller;

import com.pixelbloom.coreService.requestDto.CreatePlanRequest;
import com.pixelbloom.coreService.responseDto.MembershipPlanResponse;
import com.pixelbloom.coreService.service.MembershipPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memberships/plans")
@RequiredArgsConstructor
public class MembershipPlanController {

    private final MembershipPlanService planService;

    /** GET /api/memberships/plans — ADMIN, MEMBER, TRAINER */
    @GetMapping
    public ResponseEntity<List<MembershipPlanResponse>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllActivePlans());
    }

    /** GET /api/memberships/plans/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<MembershipPlanResponse> getPlan(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    /** POST /api/memberships/plans — ADMIN only */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembershipPlanResponse> createPlan(@Valid @RequestBody CreatePlanRequest request) {
        return ResponseEntity.status(201).body(planService.createPlan(request));
    }

    /** PUT /api/memberships/plans/{id} — ADMIN only */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembershipPlanResponse> updatePlan(@PathVariable Long id,
                                                              @Valid @RequestBody CreatePlanRequest request) {
        return ResponseEntity.ok(planService.updatePlan(id, request));
    }

    /** DELETE /api/memberships/plans/{id} — ADMIN only (soft delete) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivatePlan(@PathVariable Long id) {
        planService.deactivatePlan(id);
        return ResponseEntity.noContent().build();
    }
}
