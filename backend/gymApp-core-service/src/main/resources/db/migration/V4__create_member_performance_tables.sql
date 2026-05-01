-- V4: Add member health logs and goals tables for local performance tracking
-- Replaces the dependency on an external gym-performance-service

CREATE TABLE IF NOT EXISTS member_health_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id   BIGINT       NOT NULL,
    log_date    DATE         NOT NULL,
    weight      DOUBLE,
    heart_rate  INT,
    notes       VARCHAR(500),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_health_log_member_date (member_id, log_date)
);

CREATE TABLE IF NOT EXISTS member_goals (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id        BIGINT        NOT NULL,
    goal_description VARCHAR(500)  NOT NULL,
    target_date      DATE,
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_goal_member_active (member_id, is_active)
);
