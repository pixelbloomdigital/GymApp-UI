-- Migration: Create attendance_job_logs table
-- Requirements: 1.4, 1.5
-- Tracks AI attendance job execution for observability and timeout handling.

CREATE TABLE IF NOT EXISTS attendance_job_logs (
    id                    BIGINT          NOT NULL AUTO_INCREMENT,

    -- FK to trainer_attendance.id (the session that triggered this job)
    session_id            BIGINT          NOT NULL,

    batch_id              BIGINT          NOT NULL,
    date                  DATE            NOT NULL,

    -- Job lifecycle status: RUNNING, COMPLETED, TIMED_OUT, FAILED
    status                VARCHAR(20)     NOT NULL,

    started_at            DATETIME(6)     NOT NULL,
    completed_at          DATETIME(6)     NULL DEFAULT NULL,

    -- Counts populated on job completion (null while RUNNING)
    total_members         INT             NULL DEFAULT NULL,
    present_count         INT             NULL DEFAULT NULL,
    absent_count          INT             NULL DEFAULT NULL,
    late_count            INT             NULL DEFAULT NULL,
    pending_review_count  INT             NULL DEFAULT NULL,

    -- Populated on FAILED or TIMED_OUT status
    error_message         VARCHAR(1000)   NULL DEFAULT NULL,

    PRIMARY KEY (id)
);

-- Index to support lookup by session (used by AttendanceJobLogRepository.findBySessionId)
CREATE INDEX idx_job_logs_session_id
    ON attendance_job_logs (session_id);
