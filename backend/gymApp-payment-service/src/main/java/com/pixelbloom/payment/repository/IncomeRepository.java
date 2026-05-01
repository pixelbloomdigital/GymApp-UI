package com.pixelbloom.payment.repository;

import com.pixelbloom.payment.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByIncomeDateBetweenOrderByIncomeDateDesc(LocalDate from, LocalDate to);

    List<Income> findByTopicIgnoreCaseOrderByIncomeDateDesc(String topic);

    @Query("SELECT i FROM Income i WHERE YEAR(i.incomeDate) = :year AND MONTH(i.incomeDate) = :month ORDER BY i.incomeDate DESC")
    List<Income> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE YEAR(i.incomeDate) = :year AND MONTH(i.incomeDate) = :month")
    BigDecimal sumByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.topic = :topic AND YEAR(i.incomeDate) = :year AND MONTH(i.incomeDate) = :month")
    BigDecimal sumByTopicAndYearAndMonth(@Param("topic") String topic, @Param("year") int year, @Param("month") int month);
}
