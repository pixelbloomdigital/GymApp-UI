package com.pixelbloom.authLogin.repository;

import com.pixelbloom.authLogin.entity.DemoBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DemoBookingRepository extends JpaRepository<DemoBooking, Long> {
    boolean existsByVisitorIdAndSlotId(Long visitorId, Long slotId);
    Optional<DemoBooking> findByOrderNumber(String orderNumber);
    java.util.List<DemoBooking> findAllByOrderByBookedAtDesc();
    java.util.List<DemoBooking> findByVisitorId(Long visitorId);
    long countByStatus(com.pixelbloom.authLogin.enums.DemoBookingStatus status);
}
