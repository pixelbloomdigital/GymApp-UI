package com.pixelbloom.coreService.service;

import java.util.List;

import com.pixelbloom.coreService.requestDto.DietPlanAssignmentRequest;
import com.pixelbloom.coreService.responseDto.MemberDietPlanResponse;

public interface MemberDietPlanService {
    MemberDietPlanResponse purchaseDietPlan(Long memberId);
    MemberDietPlanResponse getByMemberId(Long memberId);
    List<MemberDietPlanResponse> getPurchasesForTrainer(Long trainerId);
    MemberDietPlanResponse assignDietPlan(DietPlanAssignmentRequest request);
}
