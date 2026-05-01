-- ============================================================
-- SCHEMA DUMP: gym_customersdb (Hibernate-managed tables)
-- These tables are NOT covered by Flyway migrations.
-- Run this once on a fresh database before seed_data.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS gym_customersdb;
USE gym_customersdb;

-- ------------------------------------------------------------
-- customers  (Member entity)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(255)    NULL,
    email       VARCHAR(255)    NULL,
    phone       VARCHAR(255)    NULL,
    address     VARCHAR(255)    NULL,
    city        VARCHAR(255)    NULL,
    state       VARCHAR(255)    NULL,
    pincode     VARCHAR(255)    NULL,
    status      VARCHAR(20)     NULL,   -- ACTIVE | INACTIVE | BLOCKED
    created_at  DATETIME(6)     NULL,
    updated_at  DATETIME(6)     NULL,
    PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- batches  (Batch entity)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS batches (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    name                VARCHAR(255)    NULL,
    type                VARCHAR(20)     NULL,   -- ZUMBA | FITNESS | YOGA | CROSSFIT | CARDIO | GENERAL | DANCE
    time_slot           VARCHAR(255)    NULL,
    capacity            INT             NULL,
    current_enrollment  INT             NULL DEFAULT 0,
    trainer_id          BIGINT          NULL,
    is_active           BIT(1)          NULL DEFAULT 1,
    created_at          DATETIME(6)     NULL,
    PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- membership_plans  (MembershipPlan entity)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS membership_plans (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    name             VARCHAR(255)    NULL,
    description      VARCHAR(1000)   NULL,
    duration_months  INT             NULL,
    price            DECIMAL(19,2)   NULL,
    days_per_week    INT             NULL,
    is_active        BIT(1)          NULL DEFAULT 1,
    created_at       DATETIME(6)     NULL,
    updated_at       DATETIME(6)     NULL,
    PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- member_memberships  (MemberMembership entity)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_memberships (
    id                       BIGINT          NOT NULL AUTO_INCREMENT,
    member_id                BIGINT          NULL,
    plan_id                  BIGINT          NULL,
    batch_id                 BIGINT          NULL,
    start_date               DATE            NULL,
    end_date                 DATE            NULL,
    status                   VARCHAR(20)     NULL,   -- PENDING_PAYMENT | ACTIVE | EXPIRED | CANCELLED | SUSPENDED
    order_number             VARCHAR(255)    NULL,
    paid_amount              DECIMAL(19,2)   NULL,
    payment_transaction_id   VARCHAR(255)    NULL,
    assigned_by              BIGINT          NULL,
    created_at               DATETIME(6)     NULL,
    updated_at               DATETIME(6)     NULL,
    PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- trainer_attendance  (TrainerAttendance entity)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trainer_attendance (
    id                    BIGINT          NOT NULL AUTO_INCREMENT,
    trainer_id            BIGINT          NOT NULL,
    batch_id              BIGINT          NOT NULL,
    batch_type            VARCHAR(20)     NULL,
    date                  DATE            NOT NULL,
    session_start_time    TIME            NULL,
    session_end_time      TIME            NULL,
    hours_worked          DOUBLE          NULL,
    rate_per_hour         DECIMAL(19,2)   NULL,
    session_earnings      DECIMAL(19,2)   NULL,
    status                VARCHAR(20)     NULL,   -- IN_PROGRESS | COMPLETED | CANCELLED | SUBSTITUTE
    substitute_trainer_id BIGINT          NULL,
    notes                 VARCHAR(255)    NULL,
    created_at            DATETIME(6)     NULL,
    updated_at            DATETIME(6)     NULL,
    PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- batch_pay_rates  (BatchPayRate entity)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS batch_pay_rates (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    batch_type      VARCHAR(20)     NOT NULL,
    batch_id        BIGINT          NULL,
    trainer_id      BIGINT          NULL,
    rate_per_hour   DECIMAL(19,2)   NOT NULL,
    effective_from  DATE            NOT NULL,
    effective_to    DATE            NULL,
    is_active       BIT(1)          NULL DEFAULT 1,
    created_at      DATETIME(6)     NULL,
    PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- trainer_payroll  (TrainerPayroll entity)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trainer_payroll (
    id                       BIGINT          NOT NULL AUTO_INCREMENT,
    trainer_id               BIGINT          NOT NULL,
    payroll_month            VARCHAR(7)      NOT NULL,   -- e.g. "2026-03"
    total_hours_worked       DOUBLE          NULL,
    total_sessions_conducted INT             NULL,
    total_sessions_cancelled INT             NULL,
    batch_breakdown_json     JSON            NULL,
    total_earnings           DECIMAL(19,2)   NULL,
    status                   VARCHAR(10)     NULL DEFAULT 'DRAFT',  -- DRAFT | APPROVED | PAID
    paid_on                  DATE            NULL,
    payment_reference        VARCHAR(255)    NULL,
    approved_by              BIGINT          NULL,
    created_at               DATETIME(6)     NULL,
    updated_at               DATETIME(6)     NULL,
    UNIQUE KEY uq_trainer_payroll_month (trainer_id, payroll_month),
    PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- visitor_feedback  (VisitorFeedback entity)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitor_feedback (
    feedback_id  BIGINT          NOT NULL AUTO_INCREMENT,
    visitor_id   BIGINT          NULL,
    feedback     VARCHAR(255)    NULL,
    rating       INT             NOT NULL,
    PRIMARY KEY (feedback_id)
);
