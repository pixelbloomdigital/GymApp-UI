package com.pixelbloom.payment.repository;

import com.pixelbloom.payment.constants.PaymentPurpose;
import com.pixelbloom.payment.constants.PaymentStatus;
import com.pixelbloom.payment.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByOrderNumber(String orderNumber);

    /** Payments between two dates (SUCCESS only) */
    List<PaymentTransaction> findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
            PaymentStatus status, LocalDateTime from, LocalDateTime to);

    /** Payments by purpose/topic (SUCCESS only) */
    List<PaymentTransaction> findByStatusAndPurposeOrderByCreatedAtDesc(
            PaymentStatus status, PaymentPurpose purpose);

    /** Payments by month and year (SUCCESS only) */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.status = 'SUCCESS' " +
           "AND YEAR(t.createdAt) = :year AND MONTH(t.createdAt) = :month ORDER BY t.createdAt DESC")
    List<PaymentTransaction> findSuccessByYearAndMonth(@Param("year") int year, @Param("month") int month);
}
