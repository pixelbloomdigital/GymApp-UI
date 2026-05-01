package com.pixelbloom.authLogin.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PermissionType {

    // ── Visitor ──────────────────────────────────────────────────────────────
    VISITOR_READ("gym:visitor:read"),
    VISITOR_WRITE("gym:visitor:write"),

    // ── Member ───────────────────────────────────────────────────────────────
    MEMBER_READ("gym:member:read"),
    MEMBER_WRITE("gym:member:write"),

    // ── Membership ───────────────────────────────────────────────────────────
    MEMBERSHIP_READ("gym:membership:read"),
    MEMBERSHIP_WRITE("gym:membership:write"),
    MEMBERSHIP_DELETE("gym:membership:delete"),

    // ── Diet Plan ────────────────────────────────────────────────────────────
    DIET_PLAN_READ("gym:diet:read"),
    DIET_PLAN_WRITE("gym:diet:write"),

    // ── Attendance ───────────────────────────────────────────────────────────
    ATTENDANCE_READ("gym:attendance:read"),
    ATTENDANCE_WRITE("gym:attendance:write"),

    // ── Batch ────────────────────────────────────────────────────────────────
    BATCH_READ("gym:batch:read"),
    BATCH_WRITE("gym:batch:write"),

    // ── Trainer ──────────────────────────────────────────────────────────────
    TRAINER_READ("gym:trainer:read"),
    TRAINER_WRITE("gym:trainer:write"),

    // ── Payroll ──────────────────────────────────────────────────────────────
    PAYROLL_READ("gym:payroll:read"),
    PAYROLL_WRITE("gym:payroll:write"),

    // ── Equipment & Expenses ─────────────────────────────────────────────────
    EQUIPMENT_READ("gym:equipment:read"),
    EQUIPMENT_WRITE("gym:equipment:write"),
    EXPENSE_READ("gym:expense:read"),
    EXPENSE_WRITE("gym:expense:write"),

    // ── Reports & Dashboard ──────────────────────────────────────────────────
    REPORT_VIEW("gym:report:view"),
    DASHBOARD_VIEW("gym:dashboard:view"),

    // ── Announcements ────────────────────────────────────────────────────────
    ANNOUNCEMENT_READ("gym:announcement:read"),
    ANNOUNCEMENT_WRITE("gym:announcement:write"),

    // ── Costume / Events ─────────────────────────────────────────────────────
    COSTUME_READ("gym:costume:read"),
    COSTUME_BOOK("gym:costume:book"),
    EVENT_READ("gym:event:read"),
    EVENT_WRITE("gym:event:write"),

    // ── User Management (admin only) ─────────────────────────────────────────
    USER_MANAGE("gym:user:manage");

    private final String permission;
}
