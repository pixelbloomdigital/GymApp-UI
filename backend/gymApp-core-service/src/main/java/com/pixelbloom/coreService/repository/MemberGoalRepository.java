package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.model.memberModel.MemberGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberGoalRepository extends JpaRepository<MemberGoal, Long> {

    /** Returns the member's current active goal, if any. */
    Optional<MemberGoal> findTopByMemberIdAndIsActiveTrueOrderByCreatedAtDesc(Long memberId);

    /** Returns the latest goal for a member irrespective of active status. */
    Optional<MemberGoal> findTopByMemberIdOrderByCreatedAtDesc(Long memberId);
}
