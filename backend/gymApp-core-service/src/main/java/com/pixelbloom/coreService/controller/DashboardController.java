package com.pixelbloom.coreService.controller;

import com.pixelbloom.coreService.responseDto.DashboardSummaryResponse;
import com.pixelbloom.coreService.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final RestTemplate restTemplate;

    @Value("${payment.service.url}")
    private String paymentServiceUrl;

    /**
     * GET /api/dashboard/summary — Admin only
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    /**
     * GET /api/dashboard/income/monthly?year=2025&month=1 — Admin only
     * Proxies to payment-service monthly summary (income + expenses + net profit)
     */
    @GetMapping("/income/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMonthlyIncome(@RequestParam int year, @RequestParam int month) {
        String url = paymentServiceUrl + "/api/payments/finance/summary/monthly?year=" + year + "&month=" + month;
        try {
            Object summary = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("error", "Payment service unavailable"));
        }
    }

    /**
     * GET /api/dashboard/income/by-topic?topic=MEMBERSHIP&year=2025&month=1 — Admin only
     * Proxies to payment-service topic summary
     */
    @GetMapping("/income/by-topic")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getIncomeByTopic(
            @RequestParam String topic,
            @RequestParam int year,
            @RequestParam int month) {
        String url = paymentServiceUrl + "/api/payments/finance/summary/by-topic?topic=" + topic
                + "&year=" + year + "&month=" + month;
        try {
            Object summary = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("error", "Payment service unavailable"));
        }
    }
}
