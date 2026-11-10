-- ============================================================
-- Pukur Pulse — seed.sql   (DEVELOPMENT ONLY, safe to re-run)
-- Demo login:  demo@pukurpulse.test  /  Demo@1234
-- ============================================================
USE pukur_pulse;

-- Clear old data (children first) so the script can be re-run
DELETE FROM sales;           ALTER TABLE sales AUTO_INCREMENT = 1;
DELETE FROM harvests;        ALTER TABLE harvests AUTO_INCREMENT = 1;
DELETE FROM expenses;        ALTER TABLE expenses AUTO_INCREMENT = 1;
DELETE FROM water_readings;  ALTER TABLE water_readings AUTO_INCREMENT = 1;
DELETE FROM feed_logs;       ALTER TABLE feed_logs AUTO_INCREMENT = 1;
DELETE FROM stocking_batches;ALTER TABLE stocking_batches AUTO_INCREMENT = 1;
DELETE FROM ponds;           ALTER TABLE ponds AUTO_INCREMENT = 1;
DELETE FROM fish_species;    ALTER TABLE fish_species AUTO_INCREMENT = 1;
DELETE FROM users;           ALTER TABLE users AUTO_INCREMENT = 1;

-- [Syllabus #3 INSERT]
INSERT INTO users (user_id, full_name, email, phone, password_hash) VALUES
  (1, 'Demo Farmer', 'demo@pukurpulse.test', '01700000000', '$2b$10$w4MfBCnmcKWk5Nwq6rYWcubmLC2m.977.4lA4.YnA0oc7M9w6CK/.');

INSERT INTO fish_species (species_id, species_name) VALUES
  (1, 'Tilapia'), (2, 'Rui'), (3, 'Catla'), (4, 'Pangas'), (5, 'Silver Carp'), (6, 'Mrigal');

-- 5 ponds. Pond 5 has NO batch. Pond 4 has NO water reading.
INSERT INTO ponds (pond_id, user_id, pond_name, area_decimal, water_type, location, status) VALUES
  (1, 1, 'Big Pond',     40.00, 'freshwater', 'Mymensingh Sadar', 'active'),
  (2, 1, 'Small Pond',   15.50, 'freshwater', 'Mymensingh Sadar', 'active'),
  (3, 1, 'North Pond',   25.00, 'freshwater', 'Trishal',          'active'),
  (4, 1, 'South Pond',   30.00, 'freshwater', 'Trishal',          'active'),
  (5, 1, 'Spare Pond',    8.00, NULL,         'Mymensingh Sadar', 'maintenance');

-- 8 batches. Batch 7 has no feed and no harvest. Batch 5 and 8 have feed but no harvest.
INSERT INTO stocking_batches
  (batch_id, pond_id, species_id, stocking_date, initial_quantity, initial_avg_weight, purchase_cost, status) VALUES
  (1, 1, 2, '2026-04-10', 3000, 25.00,  9000.00, 'completed'),
  (2, 1, 3, '2026-04-10', 1500, 30.00,  6000.00, 'completed'),
  (3, 2, 1, '2026-06-15', 5000,  5.00,  7500.00, 'harvesting'),
  (4, 3, 4, '2026-05-01', 4000, 15.00, 16000.00, 'harvesting'),
  (5, 3, 5, '2026-09-01', 2000, 20.00,  6000.00, 'active'),
  (6, 4, 6, '2026-03-20', 2500, 20.00,  7500.00, 'completed'),
  (7, 1, 1, '2026-10-15', 4000,  5.00,  6000.00, 'active'),
  (8, 2, 2, '2026-09-20', 2500, 25.00,  7500.00, 'active');

INSERT INTO feed_logs (batch_id, feed_date, feed_type, quantity_kg, cost) VALUES
  (1, '2026-04-15', 'Starter',  120.00,  8400.00),
  (1, '2026-05-10', 'Starter',  200.00, 14000.00),
  (1, '2026-06-05', 'Grower',   300.00, 18600.00),
  (1, '2026-07-01', 'Grower',   350.00, 21700.00),
  (1, '2026-08-05', 'Finisher', 300.00, 17400.00),
  (2, '2026-04-20', 'Starter',   60.00,  4200.00),
  (2, '2026-06-20', 'Grower',   200.00, 12400.00),
  (2, '2026-07-25', 'Finisher', 180.00, 10440.00),
  (3, '2026-06-20', 'Starter',  150.00, 10500.00),
  (3, '2026-08-25', 'Grower',   400.00, 24800.00),
  (3, '2026-10-15', 'Finisher', 200.00, 11600.00),
  (4, '2026-05-06', 'Starter',  150.00, 10500.00),
  (4, '2026-07-15', 'Grower',   500.00, 31000.00),
  (4, '2026-09-25', 'Finisher', 450.00, 26100.00),
  (4, '2026-10-20', 'Finisher', 600.00, 34800.00),
  (5, '2026-09-05', 'Starter',   50.00,  3500.00),
  (5, '2026-10-28', 'Grower',    90.00,  5580.00),
  (6, '2026-03-25', 'Starter',  100.00,  7000.00),
  (6, '2026-05-30', 'Grower',   250.00, 15500.00),
  (6, '2026-07-15', 'Finisher', 200.00, 11600.00),
  (8, '2026-09-25', 'Starter',  120.00,  8400.00),
  (8, '2026-10-25', 'Grower',   200.00, 12400.00);

-- NULL = not measured. Normal and abnormal values are both present.
INSERT INTO water_readings (pond_id, recorded_at, ph, dissolved_oxygen, temperature, notes) VALUES
  (1, '2026-09-28 06:00:00', 7.30, 5.60, 28.50, NULL),
  (1, '2026-10-22 06:00:00', 7.40, 5.80, 27.50, NULL),
  (1, '2026-10-26 06:00:00', 7.20, NULL, 27.00, 'DO meter unavailable'),
  (1, '2026-10-30 06:00:00', 7.60, 3.10, 26.00, 'Low DO at dawn'),
  (1, '2026-11-02 06:00:00', 7.50, 5.20, 26.50, NULL),
  (2, '2026-10-21 07:00:00', 7.10, 5.50, 28.00, NULL),
  (2, '2026-10-27 07:00:00', 5.90, 5.00, 27.50, 'pH low after rain'),
  (2, '2026-11-03 07:00:00', 7.00, 5.10, 26.50, NULL),
  (3, '2026-10-20 06:30:00', 7.80, 6.20, 28.50, NULL),
  (3, '2026-10-24 06:30:00', 7.90, 2.80, 29.00, 'DO very low'),
  (3, '2026-10-28 06:30:00', NULL, 4.90, 28.00, 'pH meter unavailable'),
  (3, '2026-11-02 06:30:00', 7.70, 5.60, 27.50, NULL),
  (5, '2026-10-29 06:00:00', 9.20, 6.00, 28.00, 'High pH'),
  (5, '2026-11-03 18:00:00', NULL, NULL, 33.50, 'Temperature only');

INSERT INTO harvests (harvest_id, batch_id, harvest_date, quantity_kg, average_weight, notes) VALUES
  (1, 1, '2026-08-20', 700.00, 520.00, 'First partial harvest'),
  (2, 1, '2026-09-15', 600.00, 560.00, 'Final harvest'),
  (3, 2, '2026-08-22', 500.00, 640.00, 'Final harvest'),
  (4, 3, '2026-10-25', 300.00, 420.00, 'First partial harvest'),
  (5, 4, '2026-10-28', 800.00, 950.00, 'First partial harvest'),
  (6, 6, '2026-08-30', 560.00, 500.00, 'Final harvest');

-- Total sold per batch never exceeds total harvested. Paid and unpaid mixed.
INSERT INTO sales (batch_id, buyer_name, sale_date, quantity_kg, price_per_kg, payment_status) VALUES
  (1, 'Hasan Traders',     '2026-08-20', 300.00, 220.00, 'paid'),
  (1, 'Dhaka Fish Co',     '2026-08-21', 250.00, 215.00, 'paid'),
  (1, 'Hasan Traders',     '2026-09-15', 400.00, 225.00, 'paid'),
  (1, 'Rafiq & Sons',      '2026-09-16', 150.00, 220.00, 'unpaid'),
  (2, 'Dhaka Fish Co',     '2026-08-22', 300.00, 240.00, 'paid'),
  (2, 'City Hotel Supply', '2026-08-23', 200.00, 235.00, 'unpaid'),
  (3, 'Karim Fish House',  '2026-10-26', 120.00, 160.00, 'paid'),
  (3, 'Local Market',      '2026-10-27', 100.00, 155.00, 'unpaid'),
  (4, 'City Hotel Supply', '2026-10-29', 400.00, 150.00, 'paid'),
  (4, 'Local Market',      '2026-10-30', 200.00, 145.00, 'unpaid'),
  (6, 'Bogura Aratdar',    '2026-08-30', 300.00, 180.00, 'paid'),
  (6, 'Rafiq & Sons',      '2026-08-31', 200.00, 175.00, 'paid');

INSERT INTO expenses (batch_id, expense_date, expense_type, description, amount) VALUES
  (1, '2026-05-15', 'Labor',          'Monthly pond caretaker',   6000.00),
  (1, '2026-08-18', 'Transportation', 'Fish carrying to market',  3500.00),
  (2, '2026-07-10', 'Maintenance',    'Net repair',               1800.00),
  (3, '2026-07-15', 'Electricity',    'Aerator power',            2400.00),
  (3, '2026-10-24', 'Transportation', 'Harvest transport',        2000.00),
  (4, '2026-08-20', 'Electricity',    'Aerator power',            3800.00),
  (4, '2026-09-20', 'Labor',          'Netting crew',             7500.00),
  (4, '2026-10-27', 'Transportation', 'Harvest transport',        4500.00),
  (5, '2026-10-02', 'Other',          'Net purchase',             1200.00),
  (6, '2026-06-20', 'Labor',          'Monthly pond caretaker',   5000.00),
  (6, '2026-08-29', 'Transportation', 'Fish carrying to market',  3000.00),
  (8, '2026-10-10', 'Maintenance',    'Embankment repair',        3500.00);
