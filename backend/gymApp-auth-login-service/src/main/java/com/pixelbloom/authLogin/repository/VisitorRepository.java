package com.pixelbloom.authLogin.repository;

import com.pixelbloom.authLogin.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VisitorRepository extends JpaRepository<Visitor, Long> {

    Optional<Visitor> findByEmail(String email);
    Optional<Visitor> findByPhone(String phone);

    Optional<Visitor> findByProviderId(String providerId);

    List<Visitor> findByName(String name);
    List<Visitor> findByVisitedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Visitor> findByGymCenter(String gymCenter);
    long countByVisitDate(LocalDate visitDate);
}
