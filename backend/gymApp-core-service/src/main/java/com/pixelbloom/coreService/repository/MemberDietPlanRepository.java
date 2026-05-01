package com.pixelbloom.coreService.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pixelbloom.coreService.model.memberModel.MemberDietPlan;

public interface MemberDietPlanRepository extends JpaRepository<MemberDietPlan, Long> {
    Optional<MemberDietPlan> findByMemberId(Long memberId);
    List<MemberDietPlan> findByMemberIdIn(Collection<Long> memberIds);
}
