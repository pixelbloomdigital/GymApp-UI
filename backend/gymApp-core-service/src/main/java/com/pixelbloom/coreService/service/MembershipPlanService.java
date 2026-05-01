package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.requestDto.CreatePlanRequest;
import com.pixelbloom.coreService.responseDto.MembershipPlanResponse;

import java.util.List;

public interface MembershipPlanService {
    MembershipPlanResponse createPlan(CreatePlanRequest request);
    MembershipPlanResponse updatePlan(Long id, CreatePlanRequest request);
    void deactivatePlan(Long id);
    List<MembershipPlanResponse> getAllActivePlans();
    MembershipPlanResponse getPlanById(Long id);
}
