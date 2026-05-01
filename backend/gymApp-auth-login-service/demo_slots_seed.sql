-- Run this against gymauthdb to seed demo slots
-- Matches the BATCHES array in PublicPortal.jsx exactly

USE gymauthdb;

INSERT IGNORE INTO demo_slot (slot_id, batch_type, slot_type, start_time, end_time, capacity, booked_count) VALUES
(1, 'ZUMBA', 'MORNING', '06:00', '07:00', 20, 0),
(2, 'YOGA',  'MORNING', '07:00', '08:00', 15, 0),
(3, 'DANCE', 'MORNING', '08:00', '09:00', 25, 0),
(4, 'ZUMBA', 'EVENING', '18:00', '19:00', 20, 0),
(5, 'YOGA',  'EVENING', '19:00', '20:00', 15, 0);

-- Seed the FREEDEMO coupon (100% discount) so coupon-based free bookings work
INSERT IGNORE INTO coupon (code, discount_type, discount_value, active) VALUES
('FREEDEMO', 'PERCENT', 100.0, true);
