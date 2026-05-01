package com.pixelbloom.authLogin.repository;

import com.pixelbloom.authLogin.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import com.pixelbloom.authLogin.entity.Member;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE Member m SET m.memberStatus = :status WHERE m.memberId = :memberId")
    int updateMemberStatus(Long memberId, MemberStatus status);

    Optional<Member> findByPhone(String phone);

    @Query("SELECT m FROM Member m WHERE m.role = :role ORDER BY m.memberId DESC")
    List<Member> findByRole(com.pixelbloom.authLogin.enums.Role role);

    @Query("SELECT m FROM Member m WHERE m.role IN ('TRAINER','ADMIN') ORDER BY m.role, m.memberId")
    List<Member> findAllStaff();



}