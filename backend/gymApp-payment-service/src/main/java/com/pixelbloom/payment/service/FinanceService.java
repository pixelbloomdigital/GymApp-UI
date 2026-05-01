package com.pixelbloom.payment.service;

import java.time.LocalDate;
import java.util.List;

import com.pixelbloom.payment.constants.PaymentPurpose;
import com.pixelbloom.payment.entity.PaymentTransaction;
import com.pixelbloom.payment.requestDto.ExpenseRequest;
import com.pixelbloom.payment.requestDto.IncomeRequest;
import com.pixelbloom.payment.responseDto.ExpenseResponse;
import com.pixelbloom.payment.responseDto.IncomeResponse;
import com.pixelbloom.payment.responseDto.PaymentSummaryResponse;

public interface FinanceService {

    // ── Payments (read from PaymentTransaction) ──────────────────────────────

    List<PaymentTransaction> getPaymentsByDateRange(LocalDate from, LocalDate to);

    List<PaymentTransaction> getPaymentsByTopic(PaymentPurpose purpose);

    List<PaymentTransaction> getPaymentsByMonth(int year, int month);

    // ── Expenses ─────────────────────────────────────────────────────────────

    ExpenseResponse recordExpense(ExpenseRequest request);

    void deleteExpense(Long expenseId);

    List<ExpenseResponse> getExpensesByDateRange(LocalDate from, LocalDate to);

    List<ExpenseResponse> getExpensesByTopic(String topic);

    List<ExpenseResponse> getExpensesByMonth(int year, int month);

    // ── Income ───────────────────────────────────────────────────────────────

    IncomeResponse recordIncome(IncomeRequest request);

    List<IncomeResponse> getIncomeByDateRange(LocalDate from, LocalDate to);

    List<IncomeResponse> getIncomeByTopic(String topic);

    List<IncomeResponse> getIncomeByMonth(int year, int month);

    // ── Dashboard summary ────────────────────────────────────────────────────

    PaymentSummaryResponse getMonthlySummary(int year, int month);

    PaymentSummaryResponse getSummaryByTopic(String topic, int year, int month);
}
