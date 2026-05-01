package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.model.memberModel.MemberHealthLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface MemberHealthLogRepository extends JpaRepository<MemberHealthLog, Long> {

    /** Returns the most recently created health log for a member on a given date. */
    Optional<MemberHealthLog> findTopByMemberIdAndLogDateOrderByCreatedAtDesc(Long memberId, LocalDate logDate);

    /** Returns the latest health log for a member irrespective of date. */
    Optional<MemberHealthLog> findTopByMemberIdOrderByCreatedAtDesc(Long memberId);
}
