CREATE TABLE IF NOT EXISTS equipment (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    quantity INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    contact VARCHAR(255),
    purchased_date DATE,
    expense_id BIGINT,
    created_at DATETIME,
    updated_at DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_equipment_expense FOREIGN KEY (expense_id) REFERENCES expenses(id)
);

INSERT INTO equipment (id, name, description, quantity, amount, vendor, address, contact, purchased_date, created_at, updated_at)
VALUES
    (1, 'Treadmill', 'Cardio machine', 4, 75000.00, 'DnS', '7 Sample Address', '11111111111', '2019-03-07', NOW(), NOW()),
    (2, 'Vertical Press Machine', 'For Biceps And Triceps, Upper Back', 3, 78000.00, 'SS Industries', '77 Sample Address', '1212121212', '2020-03-19', NOW(), NOW()),
    (3, 'Dumbbell - Adjustable', 'Material: Steel, Rubber Plastic', 26, 8500.00, 'Uptown Suppliers', '7 Sample Address', '0010000000', '2020-03-29', NOW(), NOW()),
    (4, 'Multi Bench Press', '6 In 1 Multi Bench', 2, 18000.00, 'DnS Suppliers', '7 Sample Address', '0300000000', '2020-04-05', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    quantity = VALUES(quantity),
    amount = VALUES(amount),
    vendor = VALUES(vendor),
    address = VALUES(address),
    contact = VALUES(contact),
    purchased_date = VALUES(purchased_date),
    updated_at = NOW();