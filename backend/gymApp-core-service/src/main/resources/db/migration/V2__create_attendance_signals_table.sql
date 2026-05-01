-- Migration: Create attendance_signals table
-- Requirements: 2.1, 2.2, 2.3, 2.4
-- Stores individual attendance signals (mobile check-in, GPS, BLE beacon) per member per session.

CREATE TABLE IF NOT EXISTS attendance_signals (
    id                        BIGINT          NOT NULL AUTO_INCREMENT,
    member_id                 BIGINT          NOT NULL,
    batch_id                  BIGINT          NOT NULL,
    date                      DATE            NOT NULL,

    -- Signal classification: MOBILE_CHECK_IN, GPS, BLE_BEACON
    signal_type               VARCHAR(20)     NOT NULL,

    -- Timestamp when the signal was captured
    signal_time               DATETIME(6)     NOT NULL,

    -- GPS fields (nullable — only populated for GPS signals)
    latitude                  DOUBLE          NULL DEFAULT NULL,
    longitude                 DOUBLE          NULL DEFAULT NULL,
    distance_from_gym_meters  DOUBLE          NULL DEFAULT NULL,

    -- BLE fields (nullable — only populated for BLE_BEACON signals)
    beacon_id                 VARCHAR(100)    NULL DEFAULT NULL,
    rssi                      INT             NULL DEFAULT NULL,

    -- Computed weight of this signal toward the member's confidence score
    confidence_contribution   DOUBLE          NULL DEFAULT NULL,

    created_at                DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id)
);

-- Index to support the primary query pattern: fetch all signals for a member in a session window
CREATE INDEX idx_signals_member_batch_date
    ON attendance_signals (member_id, batch_id, date);
