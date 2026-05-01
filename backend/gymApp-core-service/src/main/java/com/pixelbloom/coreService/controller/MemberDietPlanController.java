package com.pixelbloom.coreService.controller;

import com.pixelbloom.coreService.requestDto.DietPlanAssignmentRequest;
import com.pixelbloom.coreService.responseDto.MemberDietPlanResponse;
import com.pixelbloom.coreService.service.MemberDietPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diet-plans")
@RequiredArgsConstructor
public class MemberDietPlanController {

    private final MemberDietPlanService memberDietPlanService;

    @PostMapping("/purchase/{memberId}")
    @PreAuthorize("hasAnyRole('MEMBER','ADMIN')")
    public ResponseEntity<MemberDietPlanResponse> purchaseDietPlan(@PathVariable Long memberId) {
        return ResponseEntity.ok(memberDietPlanService.purchaseDietPlan(memberId));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('MEMBER','ADMIN','TRAINER')")
    public ResponseEntity<MemberDietPlanResponse> getMemberDietPlan(@PathVariable Long memberId) {
        return ResponseEntity.ok(memberDietPlanService.getByMemberId(memberId));
    }

    @GetMapping("/trainer/{trainerId}/purchases")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<List<MemberDietPlanResponse>> getTrainerPurchasedMembers(@PathVariable Long trainerId) {
        return ResponseEntity.ok(memberDietPlanService.getPurchasesForTrainer(trainerId));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<MemberDietPlanResponse> assignDietPlan(@Valid @RequestBody DietPlanAssignmentRequest request) {
        return ResponseEntity.ok(memberDietPlanService.assignDietPlan(request));
    }
}
