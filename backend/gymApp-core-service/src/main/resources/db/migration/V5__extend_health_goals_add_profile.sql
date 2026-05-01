-- V5: Extend member health/goals tables and add additional profile table.
-- This migration is idempotent and safe even if columns/tables were created manually.

DROP PROCEDURE IF EXISTS migrate_v5_profile;

DELIMITER $$
CREATE PROCEDURE migrate_v5_profile()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'member_health_logs'
          AND COLUMN_NAME = 'height'
    ) THEN
        ALTER TABLE member_health_logs ADD COLUMN height DOUBLE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'member_health_logs'
          AND COLUMN_NAME = 'body_fat'
    ) THEN
        ALTER TABLE member_health_logs ADD COLUMN body_fat DOUBLE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'member_health_logs'
          AND COLUMN_NAME = 'medical_conditions'
    ) THEN
        ALTER TABLE member_health_logs ADD COLUMN medical_conditions VARCHAR(1000);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'member_health_logs'
          AND COLUMN_NAME = 'previous_injuries'
    ) THEN
        ALTER TABLE member_health_logs ADD COLUMN previous_injuries VARCHAR(1000);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'member_health_logs'
          AND COLUMN_NAME = 'current_medications'
    ) THEN
        ALTER TABLE member_health_logs ADD COLUMN current_medications VARCHAR(1000);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'member_health_logs'
          AND COLUMN_NAME = 'allergies'
    ) THEN
        ALTER TABLE member_health_logs ADD COLUMN allergies VARCHAR(1000);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'member_goals'
          AND COLUMN_NAME = 'fitness_goal'
    ) THEN
        ALTER TABLE member_goals ADD COLUMN fitness_goal VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'member_goals'
          AND COLUMN_NAME = 'diet_preference'
    ) THEN
        ALTER TABLE member_goals ADD COLUMN diet_preference VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'member_goals'
          AND COLUMN_NAME = 'diet_target'
    ) THEN
        ALTER TABLE member_goals ADD COLUMN diet_target VARCHAR(255);
    END IF;

    CREATE TABLE IF NOT EXISTS member_additional_profile (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        member_id BIGINT NOT NULL UNIQUE,
        date_of_birth DATE,
        gender VARCHAR(50),
        photo LONGBLOB,
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        gym_experience VARCHAR(50),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_member_additional_profile_member
            FOREIGN KEY (member_id) REFERENCES customers(id) ON DELETE CASCADE,
        INDEX idx_member_additional_profile_member_id (member_id)
    );
END$$
DELIMITER ;

CALL migrate_v5_profile();
DROP PROCEDURE IF EXISTS migrate_v5_profile;
