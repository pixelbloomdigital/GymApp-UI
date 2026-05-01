package com.pixelbloom.authLogin.repository;

import com.pixelbloom.authLogin.entity.OtpStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpStore, Long> {
    Optional<OtpStore> findByPhone(String phone);
    @Transactional
    void deleteByPhone(String phone);
}
