USE gym_customersdb;

-- ------------------------------------------------------------
-- membership_plans
-- ------------------------------------------------------------
INSERT IGNORE INTO membership_plans (id, name, description, duration_months, price, days_per_week, is_active, created_at, updated_at) VALUES
(1,  'Monthly Basic',    '1-month plan, 3 days/week',   1,  999.00,  3, 1, NOW(), NOW()),
(2,  'Monthly Standard', '1-month plan, 5 days/week',   1, 1499.00,  5, 1, NOW(), NOW()),
(3,  'Quarterly Basic',  '3-month plan, 3 days/week',   3, 2499.00,  3, 1, NOW(), NOW()),
(4,  'Quarterly Pro',    '3-month plan, 6 days/week',   3, 3999.00,  6, 1, NOW(), NOW()),
(5,  'Half Yearly',      '6-month unlimited plan',      6, 6999.00,  6, 1, NOW(), NOW()),
(6,  'Annual Elite',     '12-month unlimited plan',    12,11999.00,  7, 1, NOW(), NOW());

-- ------------------------------------------------------------
-- batches  (trainer_id references auth-service member IDs)
-- ------------------------------------------------------------
INSERT IGNORE INTO batches (id, name, type, time_slot, capacity, current_enrollment, trainer_id, is_active, created_at) VALUES
(1, 'Morning Zumba',      'ZUMBA',    '06:00-07:00', 20, 8,  101, 1, NOW()),
(2, 'Morning Fitness',    'FITNESS',  '07:00-08:00', 25, 12, 102, 1, NOW()),
(3, 'Morning Yoga',       'YOGA',     '07:00-08:00', 15, 6,  103, 1, NOW()),
(4, 'Evening CrossFit',   'CROSSFIT', '18:00-19:00', 20, 10, 101, 1, NOW()),
(5, 'Evening Cardio',     'CARDIO',   '19:00-20:00', 20, 7,  102, 1, NOW()),
(6, 'Evening Dance',      'DANCE',    '18:00-19:00', 15, 5,  103, 1, NOW()),
(7, 'General Fitness AM', 'GENERAL',  '08:00-09:00', 30, 15, 104, 1, NOW()),
(8, 'General Fitness PM', 'GENERAL',  '17:00-18:00', 30, 9,  104, 1, NOW());

-- ------------------------------------------------------------
-- customers  (members — IDs should match auth-service member IDs)
-- ------------------------------------------------------------
INSERT IGNORE INTO customers (id, name, email, phone, address, city, state, pincode, status, created_at, updated_at) VALUES
(1,  'Aarav Sharma',    'aarav.sharma@email.com',    '9876543201', '12 MG Road',       'Pune',    'Maharashtra', '411001', 'ACTIVE',   NOW(), NOW()),
(2,  'Priya Patel',     'priya.patel@email.com',     '9876543202', '45 FC Road',        'Pune',    'Maharashtra', '411004', 'ACTIVE',   NOW(), NOW()),
(3,  'Rohan Mehta',     'rohan.mehta@email.com',     '9876543203', '78 Baner Road',     'Pune',    'Maharashtra', '411045', 'ACTIVE',   NOW(), NOW()),
(4,  'Sneha Joshi',     'sneha.joshi@email.com',     '9876543204', '23 Kothrud',        'Pune',    'Maharashtra', '411038', 'ACTIVE',   NOW(), NOW()),
(5,  'Vikram Singh',    'vikram.singh@email.com',    '9876543205', '56 Viman Nagar',    'Pune',    'Maharashtra', '411014', 'ACTIVE',   NOW(), NOW()),
(6,  'Ananya Desai',    'ananya.desai@email.com',    '9876543206', '89 Hadapsar',       'Pune',    'Maharashtra', '411028', 'ACTIVE',   NOW(), NOW()),
(7,  'Karan Gupta',     'karan.gupta@email.com',     '9876543207', '34 Wakad',          'Pune',    'Maharashtra', '411057', 'ACTIVE',   NOW(), NOW()),
(8,  'Meera Nair',      'meera.nair@email.com',      '9876543208', '67 Hinjewadi',      'Pune',    'Maharashtra', '411057', 'ACTIVE',   NOW(), NOW()),
(9,  'Arjun Reddy',     'arjun.reddy@email.com',     '9876543209', '11 Aundh',          'Pune',    'Maharashtra', '411007', 'ACTIVE',   NOW(), NOW()),
(10, 'Divya Kulkarni',  'divya.kulkarni@email.com',  '9876543210', '22 Shivajinagar',   'Pune',    'Maharashtra', '411005', 'ACTIVE',   NOW(), NOW()),
(11, 'Rahul Verma',     'rahul.verma@email.com',     '9876543211', '33 Deccan',         'Pune',    'Maharashtra', '411004', 'INACTIVE', NOW(), NOW()),
(12, 'Pooja Iyer',      'pooja.iyer@email.com',      '9876543212', '44 Koregaon Park',  'Pune',    'Maharashtra', '411001', 'ACTIVE',   NOW(), NOW());

-- ------------------------------------------------------------
-- member_memberships
-- ------------------------------------------------------------
INSERT IGNORE INTO member_memberships (id, member_id, plan_id, batch_id, start_date, end_date, status, order_number, paid_amount, payment_transaction_id, assigned_by, created_at, updated_at) VALUES
(1,  1,  2, 1, '2026-01-01', '2026-01-31', 'ACTIVE',   'ORD-20260101-10001', 1499.00, 'TXN-001', 1, NOW(), NOW()),
(2,  2,  4, 2, '2026-01-15', '2026-04-14', 'ACTIVE',   'ORD-20260115-10002', 3999.00, 'TXN-002', 1, NOW(), NOW()),
(3,  3,  3, 3, '2026-02-01', '2026-04-30', 'ACTIVE',   'ORD-20260201-10003', 2499.00, 'TXN-003', 1, NOW(), NOW()),
(4,  4,  5, 4, '2026-01-01', '2026-06-30', 'ACTIVE',   'ORD-20260101-10004', 6999.00, 'TXN-004', 1, NOW(), NOW()),
(5,  5,  6, 5, '2026-01-01', '2026-12-31', 'ACTIVE',   'ORD-20260101-10005',11999.00, 'TXN-005', 1, NOW(), NOW()),
(6,  6,  1, 6, '2026-02-01', '2026-02-28', 'EXPIRED',  'ORD-20260201-10006',  999.00, 'TXN-006', 1, NOW(), NOW()),
(7,  7,  2, 7, '2026-03-01', '2026-03-31', 'ACTIVE',   'ORD-20260301-10007', 1499.00, 'TXN-007', 1, NOW(), NOW()),
(8,  8,  4, 1, '2026-03-01', '2026-05-31', 'ACTIVE',   'ORD-20260301-10008', 3999.00, 'TXN-008', 1, NOW(), NOW()),
(9,  9,  3, 2, '2026-02-15', '2026-05-14', 'ACTIVE',   'ORD-20260215-10009', 2499.00, 'TXN-009', 1, NOW(), NOW()),
(10, 10, 5, 3, '2026-01-10', '2026-07-09', 'ACTIVE',   'ORD-20260110-10010', 6999.00, 'TXN-010', 1, NOW(), NOW()),
(11, 11, 1, 8, '2025-12-01', '2025-12-31', 'EXPIRED',  'ORD-20251201-10011',  999.00, 'TXN-011', 1, NOW(), NOW()),
(12, 12, 6, 4, '2026-01-01', '2026-12-31', 'ACTIVE',   'ORD-20260101-10012',11999.00, 'TXN-012', 1, NOW(), NOW());

-- ------------------------------------------------------------
-- batch_pay_rates
-- ------------------------------------------------------------
INSERT IGNORE INTO batch_pay_rates (id, batch_type, batch_id, trainer_id, rate_per_hour, effective_from, effective_to, is_active, created_at) VALUES
(1, 'ZUMBA',    NULL, NULL, 500.00, '2026-01-01', NULL, 1, NOW()),
(2, 'FITNESS',  NULL, NULL, 450.00, '2026-01-01', NULL, 1, NOW()),
(3, 'YOGA',     NULL, NULL, 400.00, '2026-01-01', NULL, 1, NOW()),
(4, 'CROSSFIT', NULL, NULL, 550.00, '2026-01-01', NULL, 1, NOW()),
(5, 'CARDIO',   NULL, NULL, 400.00, '2026-01-01', NULL, 1, NOW()),
(6, 'DANCE',    NULL, NULL, 450.00, '2026-01-01', NULL, 1, NOW()),
(7, 'GENERAL',  NULL, NULL, 350.00, '2026-01-01', NULL, 1, NOW());

-- ------------------------------------------------------------
-- trainer_attendance  (sessions for March 2026)
-- ------------------------------------------------------------
INSERT IGNORE INTO trainer_attendance (id, trainer_id, batch_id, batch_type, date, session_start_time, session_end_time, hours_worked, rate_per_hour, session_earnings, status, substitute_trainer_id, notes, created_at, updated_at) VALUES
(1,  101, 1, 'ZUMBA',    '2026-03-01', '06:00:00', '07:00:00', 1.0, 500.00,  500.00, 'COMPLETED', NULL, NULL, NOW(), NOW()),
(2,  102, 2, 'FITNESS',  '2026-03-01', '07:00:00', '08:00:00', 1.0, 450.00,  450.00, 'COMPLETED', NULL, NULL, NOW(), NOW()),
(3,  103, 3, 'YOGA',     '2026-03-01', '07:00:00', '08:00:00', 1.0, 400.00,  400.00, 'COMPLETED', NULL, NULL, NOW(), NOW()),
(4,  101, 4, 'CROSSFIT', '2026-03-01', '18:00:00', '19:00:00', 1.0, 550.00,  550.00, 'COMPLETED', NULL, NULL, NOW(), NOW()),
(5,  102, 5, 'CARDIO',   '2026-03-01', '19:00:00', '20:00:00', 1.0, 400.00,  400.00, 'COMPLETED', NULL, NULL, NOW(), NOW()),
(6,  101, 1, 'ZUMBA',    '2026-03-03', '06:00:00', '07:00:00', 1.0, 500.00,  500.00, 'COMPLETED', NULL, NULL, NOW(), NOW()),
(7,  102, 2, 'FITNESS',  '2026-03-03', '07:00:00', '08:00:00', 1.0, 450.00,  450.00, 'COMPLETED', NULL, NULL, NOW(), NOW()),
(8,  101, 1, 'ZUMBA',    '2026-03-05', '06:00:00', '07:00:00', 1.0, 500.00,  500.00, 'CANCELLED', NULL, 'Trainer sick', NOW(), NOW()),
(9,  103, 3, 'YOGA',     '2026-03-05', '07:00:00', '08:00:00', 1.0, 400.00,  400.00, 'COMPLETED', NULL, NULL, NOW(), NOW()),
(10, 104, 7, 'GENERAL',  '2026-03-05', '08:00:00', '09:00:00', 1.0, 350.00,  350.00, 'COMPLETED', NULL, NULL, NOW(), NOW());

-- ------------------------------------------------------------
-- attendance  (member attendance for March 2026)
-- ------------------------------------------------------------
INSERT IGNORE INTO attendance (id, member_id, batch_id, date, time_slot, check_in_time, check_out_time, status, marked_by, marked_by_id, notes, created_at, updated_at, ai_generated, ai_suggested_status, confidence_score, review_status, overridden_by, overridden_at, session_id) VALUES
-- Batch 1 (Zumba) - 2026-03-01
(1,  1, 1, '2026-03-01', '06:00-07:00', '06:02:00', '07:01:00', 'PRESENT',       'TRAINER', 101, NULL, NOW(), NOW(), 0, NULL, NULL, NULL, NULL, NULL, 1),
(2,  8, 1, '2026-03-01', '06:00-07:00', '06:15:00', '07:00:00', 'LATE',          'TRAINER', 101, NULL, NOW(), NOW(), 0, NULL, NULL, NULL, NULL, NULL, 1),
-- Batch 2 (Fitness) - 2026-03-01
(3,  2, 2, '2026-03-01', '07:00-08:00', '07:00:00', '08:00:00', 'PRESENT',       'TRAINER', 102, NULL, NOW(), NOW(), 0, NULL, NULL, NULL, NULL, NULL, 2),
(4,  9, 2, '2026-03-01', '07:00-08:00', NULL,        NULL,       'ABSENT',        'TRAINER', 102, NULL, NOW(), NOW(), 0, NULL, NULL, NULL, NULL, NULL, 2),
-- Batch 3 (Yoga) - 2026-03-01
(5,  3, 3, '2026-03-01', '07:00-08:00', '07:05:00', '08:00:00', 'PRESENT',       'TRAINER', 103, NULL, NOW(), NOW(), 0, NULL, NULL, NULL, NULL, NULL, 3),
(6, 10, 3, '2026-03-01', '07:00-08:00', '07:00:00', '07:30:00', 'HALF_DAY',      'TRAINER', 103, NULL, NOW(), NOW(), 0, NULL, NULL, NULL, NULL, NULL, 3),
-- AI-generated attendance - 2026-03-03
(7,  1, 1, '2026-03-03', '06:00-07:00', '06:01:00', '07:02:00', 'PRESENT',       'TRAINER', 101, NULL, NOW(), NOW(), 1, 'PRESENT', 0.92, 'AUTO_FINALIZED', NULL, NULL, 6),
(8,  8, 1, '2026-03-03', '06:00-07:00', NULL,        NULL,       'ABSENT',        'TRAINER', 101, NULL, NOW(), NOW(), 1, 'ABSENT',  0.88, 'AUTO_FINALIZED', NULL, NULL, 6),
(9,  2, 2, '2026-03-03', '07:00-08:00', '07:03:00', '08:00:00', 'PRESENT',       'TRAINER', 102, NULL, NOW(), NOW(), 1, 'PRESENT', 0.95, 'AUTO_FINALIZED', NULL, NULL, 7),
-- Pending review attendance
(10, 3, 3, '2026-03-05', '07:00-08:00', '07:10:00', NULL,        'PENDING_REVIEW','TRAINER', 103, NULL, NOW(), NOW(), 1, 'PRESENT', 0.72, 'PENDING_REVIEW',  NULL, NULL, 9);

-- ------------------------------------------------------------
-- visitor_feedback
-- ------------------------------------------------------------
INSERT IGNORE INTO visitor_feedback (feedback_id, visitor_id, feedback, rating) VALUES
(1, 1, 'Great gym! Loved the Zumba classes.',        5),
(2, 2, 'Trainers are very professional.',            4),
(3, 3, 'Good equipment but needs more space.',       3),
(4, 4, 'Amazing atmosphere and friendly staff.',     5),
(5, 5, 'Yoga sessions are very relaxing.',           5);

-- ------------------------------------------------------------
-- trainer_payroll  (March 2026 draft payroll)
-- ------------------------------------------------------------
INSERT IGNORE INTO trainer_payroll (id, trainer_id, payroll_month, total_hours_worked, total_sessions_conducted, total_sessions_cancelled, batch_breakdown_json, total_earnings, status, paid_on, payment_reference, approved_by, created_at, updated_at) VALUES
(1, 101, '2026-03', 3.0, 3, 1, '[{"batchType":"ZUMBA","sessions":2,"hours":2.0,"ratePerHour":500,"earnings":1000},{"batchType":"CROSSFIT","sessions":1,"hours":1.0,"ratePerHour":550,"earnings":550}]', 1550.00, 'DRAFT', NULL, NULL, NULL, NOW(), NOW()),
(2, 102, '2026-03', 3.0, 3, 0, '[{"batchType":"FITNESS","sessions":2,"hours":2.0,"ratePerHour":450,"earnings":900},{"batchType":"CARDIO","sessions":1,"hours":1.0,"ratePerHour":400,"earnings":400}]',  1300.00, 'DRAFT', NULL, NULL, NULL, NOW(), NOW()),
(3, 103, '2026-03', 3.0, 3, 0, '[{"batchType":"YOGA","sessions":3,"hours":3.0,"ratePerHour":400,"earnings":1200}]',                                                                                      1200.00, 'DRAFT', NULL, NULL, NULL, NOW(), NOW()),
(4, 104, '2026-03', 1.0, 1, 0, '[{"batchType":"GENERAL","sessions":1,"hours":1.0,"ratePerHour":350,"earnings":350}]',                                                                                     350.00, 'DRAFT', NULL, NULL, NULL, NOW(), NOW());
