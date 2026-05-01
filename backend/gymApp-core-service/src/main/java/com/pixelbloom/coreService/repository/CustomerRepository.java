package com.pixelbloom.coreService.repository;

import com.pixelbloom.coreService.model.memberModel.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    Optional<Member> findByPhone(String phone);
}