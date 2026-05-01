package com.pixelbloom.payment.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pixelbloom.payment.constants.PaymentPurpose;
import com.pixelbloom.payment.constants.PaymentStatus;
import com.pixelbloom.payment.entity.Expense;
import com.pixelbloom.payment.entity.Income;
import com.pixelbloom.payment.entity.PaymentTransaction;
import com.pixelbloom.payment.repository.ExpenseRepository;
import com.pixelbloom.payment.repository.IncomeRepository;
import com.pixelbloom.payment.repository.PaymentTransactionRepository;
import com.pixelbloom.payment.requestDto.ExpenseRequest;
import com.pixelbloom.payment.requestDto.IncomeRequest;
import com.pixelbloom.payment.responseDto.ExpenseResponse;
import com.pixelbloom.payment.responseDto.IncomeResponse;
import com.pixelbloom.payment.responseDto.PaymentSummaryResponse;
import com.pixelbloom.payment.service.FinanceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FinanceServiceImpl implements FinanceService {

    private final PaymentTransactionRepository paymentRepo;
    private final ExpenseRepository expenseRepo;
    private final IncomeRepository incomeRepo;

    // ── Payments ─────────────────────────────────────────────────────────────

    @Override
    public List<PaymentTransaction> getPaymentsByDateRange(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end   = to.atTime(LocalTime.MAX);
        return paymentRepo.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
                PaymentStatus.SUCCESS, start, end);
    }

    @Override
    public List<PaymentTransaction> getPaymentsByTopic(PaymentPurpose purpose) {
        return paymentRepo.findByStatusAndPurposeOrderByCreatedAtDesc(PaymentStatus.SUCCESS, purpose);
    }

    @Override
    public List<PaymentTransaction> getPaymentsByMonth(int year, int month) {
        return paymentRepo.findSuccessByYearAndMonth(year, month);
    }

    // ── Expenses ─────────────────────────────────────────────────────────────

    @Override
    public ExpenseResponse recordExpense(ExpenseRequest request) {
        Expense expense = Expense.builder()
                .topic(request.getTopic().toUpperCase())
                .description(request.getDescription())
                .amount(request.getAmount())
                .paidTo(request.getPaidTo())
            .equipmentId(request.getEquipmentId())
                .expenseDate(request.getExpenseDate())
                .recordedBy(request.getRecordedBy())
                .build();
        return toExpenseResponse(expenseRepo.save(expense));
    }

    @Override
    public void deleteExpense(Long expenseId) {
        Expense expense = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found: " + expenseId));
        expenseRepo.delete(expense);
    }

    @Override
    public List<ExpenseResponse> getExpensesByDateRange(LocalDate from, LocalDate to) {
        return expenseRepo.findByExpenseDateBetweenOrderByExpenseDateDesc(from, to)
                .stream().map(this::toExpenseResponse).collect(Collectors.toList());
    }

    @Override
    public List<ExpenseResponse> getExpensesByTopic(String topic) {
        return expenseRepo.findByTopicIgnoreCaseOrderByExpenseDateDesc(topic)
                .stream().map(this::toExpenseResponse).collect(Collectors.toList());
    }

    @Override
    public List<ExpenseResponse> getExpensesByMonth(int year, int month) {
        return expenseRepo.findByYearAndMonth(year, month)
                .stream().map(this::toExpenseResponse).collect(Collectors.toList());
    }

    // ── Income ───────────────────────────────────────────────────────────────

    @Override
    public IncomeResponse recordIncome(IncomeRequest request) {
        Income income = Income.builder()
                .topic(request.getTopic().toUpperCase())
                .description(request.getDescription())
                .amount(request.getAmount())
                .customerId(request.getCustomerId())
                .orderNumber(request.getOrderNumber())
                .incomeDate(request.getIncomeDate())
                .build();
        return toIncomeResponse(incomeRepo.save(income));
    }

    @Override
    public List<IncomeResponse> getIncomeByDateRange(LocalDate from, LocalDate to) {
        return incomeRepo.findByIncomeDateBetweenOrderByIncomeDateDesc(from, to)
                .stream().map(this::toIncomeResponse).collect(Collectors.toList());
    }

    @Override
    public List<IncomeResponse> getIncomeByTopic(String topic) {
        return incomeRepo.findByTopicIgnoreCaseOrderByIncomeDateDesc(topic)
                .stream().map(this::toIncomeResponse).collect(Collectors.toList());
    }

    @Override
    public List<IncomeResponse> getIncomeByMonth(int year, int month) {
        return incomeRepo.findByYearAndMonth(year, month)
                .stream().map(this::toIncomeResponse).collect(Collectors.toList());
    }

    // ── Dashboard summaries ───────────────────────────────────────────────────

    @Override
    public PaymentSummaryResponse getMonthlySummary(int year, int month) {
        List<IncomeResponse> incomes   = getIncomeByMonth(year, month);
        List<ExpenseResponse> expenses = getExpensesByMonth(year, month);

        BigDecimal totalIncome   = incomeRepo.sumByYearAndMonth(year, month);
        BigDecimal totalExpenses = expenseRepo.sumByYearAndMonth(year, month);

        return PaymentSummaryResponse.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netProfit(totalIncome.subtract(totalExpenses))
                .incomeRecords(incomes)
                .expenseRecords(expenses)
                .build();
    }

    @Override
    public PaymentSummaryResponse getSummaryByTopic(String topic, int year, int month) {
        List<IncomeResponse> incomes   = incomeRepo.findByTopicIgnoreCaseOrderByIncomeDateDesc(topic)
                .stream().map(this::toIncomeResponse).collect(Collectors.toList());
        List<ExpenseResponse> expenses = expenseRepo.findByTopicIgnoreCaseOrderByExpenseDateDesc(topic)
                .stream().map(this::toExpenseResponse).collect(Collectors.toList());

        BigDecimal totalIncome   = incomeRepo.sumByTopicAndYearAndMonth(topic.toUpperCase(), year, month);
        BigDecimal totalExpenses = expenses.stream()
                .map(ExpenseResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PaymentSummaryResponse.builder()
                .year(year)
                .month(month)
                .topic(topic.toUpperCase())
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netProfit(totalIncome.subtract(totalExpenses))
                .incomeRecords(incomes)
                .expenseRecords(expenses)
                .build();
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private ExpenseResponse toExpenseResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .topic(e.getTopic())
                .description(e.getDescription())
                .amount(e.getAmount())
                .paidTo(e.getPaidTo())
                .equipmentId(e.getEquipmentId())
                .expenseDate(e.getExpenseDate())
                .recordedBy(e.getRecordedBy())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private IncomeResponse toIncomeResponse(Income i) {
        return IncomeResponse.builder()
                .id(i.getId())
                .topic(i.getTopic())
                .description(i.getDescription())
                .amount(i.getAmount())
                .customerId(i.getCustomerId())
                .orderNumber(i.getOrderNumber())
                .incomeDate(i.getIncomeDate())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
