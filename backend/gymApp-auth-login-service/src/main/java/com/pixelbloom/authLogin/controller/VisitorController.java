package com.pixelbloom.authLogin.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pixelbloom.authLogin.entity.Visitor;
import com.pixelbloom.authLogin.requestdto.VisitorRegisterRequest;
import com.pixelbloom.authLogin.responsedto.VisitorAdminResponse;
import com.pixelbloom.authLogin.responsedto.VisitorNotificationResponse;
import com.pixelbloom.authLogin.responsedto.VisitorRegisterResponse;
import com.pixelbloom.authLogin.service.AuthService;

import lombok.RequiredArgsConstructor;

/**
 * All visitor management endpoints — admin only (except batch-pref update by visitor themselves).
 * Base path: /api/visitors
 */
@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
public class VisitorController {

    private final AuthService authService;

    // ─── Admin: list & search ─────────────────────────────────────────────────

    /**
     * GET /api/visitors
     * Returns all registered visitors.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VisitorAdminResponse>> getAllVisitors() {
        return ResponseEntity.ok(authService.getAllVisitors());
    }

    /**
     * GET /api/visitors/{visitorId}
     * Returns full details of a single visitor.
     */
    @GetMapping("/{visitorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VisitorAdminResponse> getVisitorById(@PathVariable Long visitorId) {
        return ResponseEntity.ok(authService.getVisitorById(visitorId));
    }

    /**
     * GET /api/visitors/search?name=Priya
     * Search visitors by name.
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VisitorRegisterResponse>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(authService.getVisitorsByName(name));
    }

    /**
     * GET /api/visitors/by-date?start=2026-03-01T00:00:00&end=2026-03-31T23:59:59
     * Returns visitors who registered within a date-time range.
     */
    @GetMapping("/by-date")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Visitor>> getVisitorsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(authService.getVisitorsByDate(start, end));
    }

    /**
     * GET /api/visitors/by-gym?gymCenter=Pixelbloom+Fitness
     * Returns all visitors for a specific gym center.
     */
    @GetMapping("/by-gym")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VisitorAdminResponse>> getByGymCenter(@RequestParam String gymCenter) {
        return ResponseEntity.ok(authService.getVisitorsByGymCenter(gymCenter));
    }

    /**
     * GET /api/visitors/count?date=2026-03-23
     * Returns visitor count for a specific date.
     */
    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getCountByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(Map.of("count", authService.getVisitorCountByDate(date)));
    }

    // ─── Admin: update & delete ───────────────────────────────────────────────

    /**
     * PUT /api/visitors/{visitorId}
     * Admin updates visitor details (name, phone, gymCenter, preferredBatches, inquirySource).
     */
    @PutMapping("/{visitorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VisitorAdminResponse> updateVisitor(
            @PathVariable Long visitorId,
            @RequestBody VisitorRegisterRequest request) {
        return ResponseEntity.ok(authService.updateVisitor(visitorId, request));
    }

    /**
     * PATCH /api/visitors/{visitorId}/mark-attended
     * Admin marks a visitor as attended — sets visitedAt to current timestamp.
     */
    @PatchMapping("/{visitorId}/mark-attended")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markAttended(@PathVariable Long visitorId) {
        authService.markVisitorAttended(visitorId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/visitors/{visitorId}
     * Hard-deletes a visitor record (admin only).
     */
    @DeleteMapping("/{visitorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVisitor(@PathVariable Long visitorId) {
        authService.deleteVisitor(visitorId);
        return ResponseEntity.noContent().build();
    }

    // ─── Visitor self-service ─────────────────────────────────────────────────

    /**
     * PUT /api/visitors/{visitorId}/batch-preferences
     * Visitor updates their own preferred batches.
     */
    @PutMapping("/{visitorId}/batch-preferences")
    public ResponseEntity<Void> updateBatchPreferences(
            @PathVariable Long visitorId,
            @RequestBody VisitorRegisterRequest request) {
        authService.updateBatchPreferences(visitorId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/visitors/{visitorId}/notifications
     * Visitor can load their dashboard notifications.
     */
    @GetMapping("/{visitorId}/notifications")
    @PreAuthorize("hasRole('VISITOR') or hasRole('ADMIN')")
    public ResponseEntity<List<VisitorNotificationResponse>> getNotifications(@PathVariable Long visitorId) {
        return ResponseEntity.ok(authService.getVisitorNotifications(visitorId));
    }

    /**
     * DELETE /api/visitors/{visitorId}/self
     * Visitor deletes their own account (removes from visitor + member tables).
     */
    @DeleteMapping("/{visitorId}/self")
    @PreAuthorize("hasRole('VISITOR')")
    public ResponseEntity<Void> deleteSelf(@PathVariable Long visitorId) {
        authService.deleteVisitor(visitorId);
        return ResponseEntity.noContent().build();
    }
}
