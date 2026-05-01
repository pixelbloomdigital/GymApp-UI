package com.pixelbloom.payment.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pixelbloom.payment.constants.PaymentPurpose;
import com.pixelbloom.payment.entity.PaymentTransaction;
import com.pixelbloom.payment.requestDto.ExpenseRequest;
import com.pixelbloom.payment.requestDto.IncomeRequest;
import com.pixelbloom.payment.responseDto.ExpenseResponse;
import com.pixelbloom.payment.responseDto.IncomeResponse;
import com.pixelbloom.payment.responseDto.PaymentSummaryResponse;
import com.pixelbloom.payment.service.FinanceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    // ── Payments (read-only views) ────────────────────────────────────────────

    /**
     * GET /api/payments/finance/transactions/by-date?from=2025-01-01&to=2025-01-31
     */
    @GetMapping("/transactions/by-date")
    public ResponseEntity<List<PaymentTransaction>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(financeService.getPaymentsByDateRange(from, to));
    }

    /**
     * GET /api/payments/finance/transactions/by-topic?purpose=MEMBERSHIP
     */
    @GetMapping("/transactions/by-topic")
    public ResponseEntity<List<PaymentTransaction>> getByTopic(
            @RequestParam PaymentPurpose purpose) {
        return ResponseEntity.ok(financeService.getPaymentsByTopic(purpose));
    }

    /**
     * GET /api/payments/finance/transactions/by-month?year=2025&month=1
     */
    @GetMapping("/transactions/by-month")
    public ResponseEntity<List<PaymentTransaction>> getByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(financeService.getPaymentsByMonth(year, month));
    }

    // ── Expenses ──────────────────────────────────────────────────────────────

    /** POST /api/payments/finance/expenses — Record an outgoing expense */
    @PostMapping("/expenses")
    public ResponseEntity<ExpenseResponse> recordExpense(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.status(201).body(financeService.recordExpense(request));
    }

    /** DELETE /api/payments/finance/expenses/{id} — Delete an expense */
    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        financeService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/payments/finance/expenses/by-date?from=2025-01-01&to=2025-01-31 */
    @GetMapping("/expenses/by-date")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(financeService.getExpensesByDateRange(from, to));
    }

    /** GET /api/payments/finance/expenses/by-topic?topic=SALARY */
    @GetMapping("/expenses/by-topic")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByTopic(@RequestParam String topic) {
        return ResponseEntity.ok(financeService.getExpensesByTopic(topic));
    }

    /** GET /api/payments/finance/expenses/by-month?year=2025&month=1 */
    @GetMapping("/expenses/by-month")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByMonth(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(financeService.getExpensesByMonth(year, month));
    }

    // ── Income ────────────────────────────────────────────────────────────────

    /** POST /api/payments/finance/income — Manually record an income entry */
    @PostMapping("/income")
    public ResponseEntity<IncomeResponse> recordIncome(@Valid @RequestBody IncomeRequest request) {
        return ResponseEntity.status(201).body(financeService.recordIncome(request));
    }

    /** GET /api/payments/finance/income/by-date?from=2025-01-01&to=2025-01-31 */
    @GetMapping("/income/by-date")
    public ResponseEntity<List<IncomeResponse>> getIncomeByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(financeService.getIncomeByDateRange(from, to));
    }

    /** GET /api/payments/finance/income/by-topic?topic=MEMBERSHIP */
    @GetMapping("/income/by-topic")
    public ResponseEntity<List<IncomeResponse>> getIncomeByTopic(@RequestParam String topic) {
        return ResponseEntity.ok(financeService.getIncomeByTopic(topic));
    }

    /** GET /api/payments/finance/income/by-month?year=2025&month=1 */
    @GetMapping("/income/by-month")
    public ResponseEntity<List<IncomeResponse>> getIncomeByMonth(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(financeService.getIncomeByMonth(year, month));
    }

    // ── Dashboard summaries ───────────────────────────────────────────────────

    /**
     * GET /api/payments/finance/summary/monthly?year=2025&month=1
     * Returns total income, total expenses, net profit + all records for the month
     */
    @GetMapping("/summary/monthly")
    public ResponseEntity<PaymentSummaryResponse> getMonthlySummary(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(financeService.getMonthlySummary(year, month));
    }

    /**
     * GET /api/payments/finance/summary/by-topic?topic=MEMBERSHIP&year=2025&month=1
     * Returns income/expense breakdown for a specific topic in a given month
     */
    @GetMapping("/summary/by-topic")
    public ResponseEntity<PaymentSummaryResponse> getSummaryByTopic(
            @RequestParam String topic,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(financeService.getSummaryByTopic(topic, year, month));
    }
}
