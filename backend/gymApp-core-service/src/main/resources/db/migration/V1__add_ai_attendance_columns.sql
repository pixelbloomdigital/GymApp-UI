-- Migration: Create attendance table with all columns including AI fields
-- Requirements: 1.2, 1.3, 3.1, 6.1, 7.1, 7.2

CREATE TABLE IF NOT EXISTS attendance (
    id                    BIGINT          NOT NULL AUTO_INCREMENT,
    member_id             BIGINT          NOT NULL,
    batch_id              BIGINT          NOT NULL,
    date                  DATE            NOT NULL,
    time_slot             VARCHAR(20)     NULL DEFAULT NULL,
    check_in_time         TIME            NULL DEFAULT NULL,
    check_out_time        TIME            NULL DEFAULT NULL,
    status                VARCHAR(20)     NULL DEFAULT NULL,
    marked_by             VARCHAR(50)     NULL DEFAULT NULL,
    marked_by_id          BIGINT          NULL DEFAULT NULL,
    notes                 VARCHAR(500)    NULL DEFAULT NULL,
    created_at            DATETIME(6)     NULL DEFAULT NULL,
    updated_at            DATETIME(6)     NULL DEFAULT NULL,

    -- AI fields (nullable for backward compatibility with manual records)
    ai_generated          BIT(1)          NULL DEFAULT NULL,
    ai_suggested_status   VARCHAR(20)     NULL DEFAULT NULL,
    confidence_score      DOUBLE          NULL DEFAULT NULL,
    review_status         VARCHAR(20)     NULL DEFAULT NULL,
    overridden_by         BIGINT          NULL DEFAULT NULL,
    overridden_at         DATETIME(6)     NULL DEFAULT NULL,
    session_id            BIGINT          NULL DEFAULT NULL,

    PRIMARY KEY (id),
    CONSTRAINT uq_attendance_member_date_batch UNIQUE (member_id, date, batch_id)
);
