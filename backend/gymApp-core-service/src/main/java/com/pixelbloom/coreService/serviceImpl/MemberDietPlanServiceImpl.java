package com.pixelbloom.coreService.serviceImpl;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pixelbloom.coreService.enums.MembershipStatus;
import com.pixelbloom.coreService.exception.BusinessRuleException;
import com.pixelbloom.coreService.exception.MemberNotFoundException;
import com.pixelbloom.coreService.model.memberModel.Member;
import com.pixelbloom.coreService.model.memberModel.MemberDietPlan;
import com.pixelbloom.coreService.model.membershipModel.Batch;
import com.pixelbloom.coreService.model.membershipModel.MemberMembership;
import com.pixelbloom.coreService.repository.BatchRepository;
import com.pixelbloom.coreService.repository.CustomerRepository;
import com.pixelbloom.coreService.repository.MemberDietPlanRepository;
import com.pixelbloom.coreService.repository.MemberMembershipRepository;
import com.pixelbloom.coreService.requestDto.DietPlanAssignmentRequest;
import com.pixelbloom.coreService.responseDto.MemberDietPlanResponse;
import com.pixelbloom.coreService.service.MemberDietPlanService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberDietPlanServiceImpl implements MemberDietPlanService {

    private final MemberDietPlanRepository dietPlanRepository;
    private final CustomerRepository customerRepository;
    private final BatchRepository batchRepository;
    private final MemberMembershipRepository memberMembershipRepository;

    @Override
    @Transactional
    public MemberDietPlanResponse purchaseDietPlan(Long memberId) {
        Long safeMemberId = Objects.requireNonNull(memberId, "memberId is required");
        Member member = customerRepository.findById(safeMemberId)
            .orElseThrow(() -> new MemberNotFoundException("Member not found: " + safeMemberId));

        MemberDietPlan dietPlan = dietPlanRepository.findByMemberId(safeMemberId)
                .orElseGet(() -> {
                    MemberDietPlan m = new MemberDietPlan();
                    m.setMemberId(safeMemberId);
                    return m;
                });

        if (!Boolean.TRUE.equals(dietPlan.getPurchased())) {
            dietPlan.setPurchased(true);
            dietPlan.setPurchasedAt(LocalDateTime.now());
        }

        return toResponse(dietPlanRepository.save(dietPlan), member);
    }

    @Override
    public MemberDietPlanResponse getByMemberId(Long memberId) {
        Long safeMemberId = Objects.requireNonNull(memberId, "memberId is required");
        Member member = customerRepository.findById(safeMemberId)
            .orElseThrow(() -> new MemberNotFoundException("Member not found: " + safeMemberId));

        MemberDietPlan plan = dietPlanRepository.findByMemberId(safeMemberId)
                .orElseGet(() -> {
                    MemberDietPlan m = new MemberDietPlan();
                m.setMemberId(safeMemberId);
                    return m;
                });

        return toResponse(plan, member);
    }

    @Override
    public List<MemberDietPlanResponse> getPurchasesForTrainer(Long trainerId) {
        List<Batch> trainerBatches = batchRepository.findByTrainerIdAndIsActiveTrue(trainerId);
        if (trainerBatches.isEmpty()) {
            return List.of();
        }

        List<Long> batchIds = trainerBatches.stream().map(Batch::getId).toList();
        List<MemberMembership> activeMemberships = memberMembershipRepository.findByBatchIdInAndStatus(batchIds, MembershipStatus.ACTIVE);
        if (activeMemberships.isEmpty()) {
            return List.of();
        }

        Set<Long> memberIds = activeMemberships.stream().map(MemberMembership::getMemberId).collect(Collectors.toCollection(LinkedHashSet::new));
        Map<Long, MemberDietPlan> dietByMemberId = dietPlanRepository.findByMemberIdIn(memberIds)
                .stream()
                .collect(Collectors.toMap(MemberDietPlan::getMemberId, d -> d));

        Iterable<Long> safeMemberIds = memberIds;
        Map<Long, Member> membersById = customerRepository.findAllById(Objects.requireNonNull(safeMemberIds, "memberIds is required"))
                .stream()
                .collect(Collectors.toMap(Member::getId, m -> m));

        return memberIds.stream()
                .map(memberId -> {
                    MemberDietPlan dietPlan = dietByMemberId.get(memberId);
                    if (dietPlan == null || !Boolean.TRUE.equals(dietPlan.getPurchased())) {
                        return null;
                    }
                    Member member = membersById.get(memberId);
                    if (member == null) {
                        return null;
                    }
                    return toResponse(dietPlan, member);
                })
                .filter(Objects::nonNull)
                .toList();
    }

    @Override
    @Transactional
    public MemberDietPlanResponse assignDietPlan(DietPlanAssignmentRequest request) {
        Long safeMemberId = Objects.requireNonNull(request.getMemberId(), "memberId is required");
        Long safeTrainerId = Objects.requireNonNull(request.getTrainerId(), "trainerId is required");

        Member member = customerRepository.findById(safeMemberId)
            .orElseThrow(() -> new MemberNotFoundException("Member not found: " + safeMemberId));

        boolean trainerOwnsMember = batchRepository.findByTrainerIdAndIsActiveTrue(safeTrainerId)
                .stream()
                .map(Batch::getId)
                .anyMatch(batchId -> memberMembershipRepository.existsByMemberIdAndBatchIdAndStatus(
                safeMemberId, batchId, MembershipStatus.ACTIVE));

        if (!trainerOwnsMember) {
            throw new BusinessRuleException("Trainer is not assigned to this member's active batch");
        }

        MemberDietPlan dietPlan = dietPlanRepository.findByMemberId(safeMemberId)
                .orElseThrow(() -> new BusinessRuleException("Member has not purchased diet plan"));

        if (!Boolean.TRUE.equals(dietPlan.getPurchased())) {
            throw new BusinessRuleException("Member has not purchased diet plan");
        }

        dietPlan.setAssignedByTrainerId(safeTrainerId);
        dietPlan.setAssignedPlanTitle(request.getPlanTitle().trim());
        dietPlan.setAssignedPlanDetails(request.getPlanDetails().trim());
        dietPlan.setAssignedAt(LocalDateTime.now());

        return toResponse(dietPlanRepository.save(dietPlan), member);
    }

    private MemberDietPlanResponse toResponse(MemberDietPlan plan, Member member) {
        MemberDietPlanResponse response = new MemberDietPlanResponse();
        response.setMemberId(member.getId());
        response.setMemberName(member.getName());
        response.setMemberEmail(member.getEmail());
        response.setPurchased(Boolean.TRUE.equals(plan.getPurchased()));
        response.setPurchasedAt(plan.getPurchasedAt());
        response.setAssignedByTrainerId(plan.getAssignedByTrainerId());
        response.setAssignedPlanTitle(plan.getAssignedPlanTitle());
        response.setAssignedPlanDetails(plan.getAssignedPlanDetails());
        response.setAssignedAt(plan.getAssignedAt());
        return response;
    }
}
