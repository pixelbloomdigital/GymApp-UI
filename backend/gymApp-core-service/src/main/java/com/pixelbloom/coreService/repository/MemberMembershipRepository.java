package com.pixelbloom.coreService.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pixelbloom.coreService.enums.MembershipStatus;
import com.pixelbloom.coreService.model.membershipModel.MemberMembership;

public interface MemberMembershipRepository extends JpaRepository<MemberMembership, Long> {
    List<MemberMembership> findByMemberId(Long memberId);
    List<MemberMembership> findByMemberIdAndStatus(Long memberId, MembershipStatus status);
    Optional<MemberMembership> findByOrderNumber(String orderNumber);
    boolean existsByMemberIdAndStatus(Long memberId, MembershipStatus status);
    List<MemberMembership> findByStatusAndEndDateBefore(MembershipStatus status, LocalDate date);
    List<MemberMembership> findByStatusAndEndDate(MembershipStatus status, LocalDate date);
    long countByStatus(MembershipStatus status);

    List<MemberMembership> findByBatchIdAndStatus(Long batchId, MembershipStatus status);
    List<MemberMembership> findByBatchIdInAndStatus(List<Long> batchIds, MembershipStatus status);
    boolean existsByMemberIdAndBatchIdAndStatus(Long memberId, Long batchId, MembershipStatus status);
}
