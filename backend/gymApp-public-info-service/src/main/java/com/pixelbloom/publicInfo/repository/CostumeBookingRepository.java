package com.pixelbloom.publicInfo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pixelbloom.publicInfo.entity.CostumeBooking;
import com.pixelbloom.publicInfo.enums.BookingStatus;

public interface CostumeBookingRepository extends JpaRepository<CostumeBooking, Long> {
    List<CostumeBooking> findByBookerIdAndBookerType(Long bookerId, String bookerType);
    Optional<CostumeBooking> findByOrderNumber(String orderNumber);
    List<CostumeBooking> findByCostumeIdAndStatus(Long costumeId, BookingStatus status);
    List<CostumeBooking> findAllByOrderByCreatedAtDesc();
}
