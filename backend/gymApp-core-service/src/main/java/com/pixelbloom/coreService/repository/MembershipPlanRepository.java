package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.model.membershipModel.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {
    List<MembershipPlan> findByIsActiveTrue();
}
