package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.model.membershipModel.MembershipPlan;
import com.pixelbloom.coreService.repository.MembershipPlanRepository;
import com.pixelbloom.coreService.requestDto.CreatePlanRequest;
import com.pixelbloom.coreService.responseDto.MembershipPlanResponse;
import com.pixelbloom.coreService.service.MembershipPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembershipPlanServiceImpl implements MembershipPlanService {

    private final MembershipPlanRepository planRepo;

    @Override
    @Transactional
    public MembershipPlanResponse createPlan(CreatePlanRequest request) {
        MembershipPlan plan = new MembershipPlan();
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setDurationMonths(request.getDurationMonths());
        plan.setPrice(request.getPrice());
        plan.setDaysPerWeek(request.getDaysPerWeek());
        plan.setIsActive(true);
        return toResponse(planRepo.save(plan));
    }

    @Override
    @Transactional
    public MembershipPlanResponse updatePlan(Long id, CreatePlanRequest request) {
        MembershipPlan plan = planRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + id));
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setDurationMonths(request.getDurationMonths());
        plan.setPrice(request.getPrice());
        plan.setDaysPerWeek(request.getDaysPerWeek());
        return toResponse(planRepo.save(plan));
    }

    @Override
    @Transactional
    public void deactivatePlan(Long id) {
        MembershipPlan plan = planRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + id));
        plan.setIsActive(false);
        planRepo.save(plan);
    }

    @Override
    public List<MembershipPlanResponse> getAllActivePlans() {
        return planRepo.findByIsActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public MembershipPlanResponse getPlanById(Long id) {
        return toResponse(planRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + id)));
    }

    private MembershipPlanResponse toResponse(MembershipPlan p) {
        MembershipPlanResponse r = new MembershipPlanResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setDurationMonths(p.getDurationMonths());
        r.setPrice(p.getPrice());
        r.setDaysPerWeek(p.getDaysPerWeek());
        r.setIsActive(p.getIsActive());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }
}
