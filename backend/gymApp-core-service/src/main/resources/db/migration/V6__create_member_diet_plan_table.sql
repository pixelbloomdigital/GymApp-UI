CREATE TABLE IF NOT EXISTS member_diet_plans (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    purchased BOOLEAN NOT NULL DEFAULT FALSE,
    purchased_at DATETIME NULL,
    assigned_by_trainer_id BIGINT NULL,
    assigned_plan_title VARCHAR(150) NULL,
    assigned_plan_details TEXT NULL,
    assigned_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_member_diet_plans_member UNIQUE (member_id)
);