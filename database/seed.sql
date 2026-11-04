-- ============================================================
-- Pukur Pulse — seed.sql  (safe to re-run: it clears old data first)
-- Run as ADMIN (root). Demo logins are documented in README (development only).
-- ============================================================
USE pukur_pulse;

-- ---------- SECTION 0: clear old data (children first) ----------
DELETE FROM sales WHERE sale_id > 0;
DELETE FROM harvests WHERE harvest_id > 0;
DELETE FROM other_expenses WHERE expense_id > 0;
DELETE FROM disease_cases WHERE case_id > 0;
DELETE FROM water_readings WHERE reading_id > 0;
DELETE FROM feed_logs WHERE feed_id > 0;
DELETE FROM stocking_batches WHERE batch_id > 0;
DELETE FROM ponds WHERE pond_id > 0;
DELETE FROM fish_species WHERE species_id > 0;
DELETE FROM app_users WHERE user_id > 0;
DELETE FROM farmers WHERE farmer_id > 0;
ALTER TABLE sales AUTO_INCREMENT = 1;
ALTER TABLE harvests AUTO_INCREMENT = 1;
ALTER TABLE other_expenses AUTO_INCREMENT = 1;
ALTER TABLE disease_cases AUTO_INCREMENT = 1;
ALTER TABLE water_readings AUTO_INCREMENT = 1;
ALTER TABLE feed_logs AUTO_INCREMENT = 1;
ALTER TABLE stocking_batches AUTO_INCREMENT = 1;
ALTER TABLE ponds AUTO_INCREMENT = 1;
ALTER TABLE fish_species AUTO_INCREMENT = 1;
ALTER TABLE app_users AUTO_INCREMENT = 1;
ALTER TABLE farmers AUTO_INCREMENT = 1;

-- ---------- SECTION 1: master data ----------
INSERT INTO farmers (farmer_id, full_name, phone, address) VALUES
  (1, 'Abdul Karim',     '01711111111', 'Shombhuganj, Mymensingh Sadar'),
  (2, 'Rahima Begum',    '01722222222', 'Shibganj, Bogura Sadar'),
  (3, 'Shafiqul Islam',  '01733333333', 'Churamankathi, Jessore Sadar'),
  (4, 'Nasrin Akter',    '01744444444', 'Laksam, Cumilla'),
  (5, 'Mizanur Rahman',  '01755555555', 'Dumuria, Khulna'),
  (6, 'Farida Yasmin',   '01766666666', 'Mithapukur, Rangpur');

INSERT INTO app_users (user_id, farmer_id, username, password_hash, role) VALUES
  (1, NULL, 'officer1', '$2b$10$RtlHdVtC/MbAFwrpHoOiee.2BUdFxHRp/zHXHbB8iJ63txWv5SSku', 'officer'),
  (2, 1,    'karim',    '$2b$10$XfIK9VK8JSWP4JuGRNvcs.S/Rh..MBttRskhXIFnz23/LiGgGmxw2', 'farmer'),
  (3, 2,    'rahima',   '$2b$10$GZgfooiOPqrhE7wadomyzOv5D00MQpoXBuEs21./SWLl6J6FHv9a.', 'farmer'),
  (4, 3,    'shafiq',   '$2b$10$MS2ByjGV/sSNx0fIO/NAQ.npU.SBqrZITaY1CHJcV27q2msgg5baW', 'farmer');

INSERT INTO fish_species (species_id, species_name, description) VALUES
  (1, 'Tilapia',      'Hardy, fast-growing freshwater fish'),
  (2, 'Rui',          'Popular carp, widely farmed in ponds'),
  (3, 'Catla',        'Surface-feeding carp'),
  (4, 'Pangas',       'Fast-growing catfish, widely farmed'),
  (5, 'Silver Carp',  'Plankton-feeding carp, often stocked with other carps'),
  (6, 'Mrigal',       'Bottom-feeding carp');

INSERT INTO ponds (pond_id, farmer_id, pond_name, area_decimal, water_type, location, status) VALUES
  (1, 1, 'Karim Big Pond',      40.00, 'freshwater', 'Mymensingh Sadar', 'active'),
  (2, 1, 'Karim Small Pond',    15.50, 'freshwater', 'Mymensingh Sadar', 'active'),
  (3, 2, 'Rahima Pond A',       25.00, 'freshwater', 'Bogura Sadar',     'active'),
  (4, 2, 'Rahima Pond B',       30.00, 'freshwater', 'Bogura Sadar',     'maintenance'),
  (5, 3, 'Shafiq North Pond',   20.00, 'freshwater', 'Jessore Sadar',    'active'),
  (6, 3, 'Shafiq South Pond',   18.00, 'freshwater', 'Jessore Sadar',    'active'),
  (7, 4, 'Nasrin Pond',         35.00, 'freshwater', 'Cumilla',          'active'),
  (8, 5, 'Mizan Pond',          50.00, 'freshwater', 'Khulna',           'active'),
  (9, 5, 'Mizan Nursery',        8.00, NULL,         'Khulna',           'inactive');

INSERT INTO stocking_batches
  (batch_id, pond_id, species_id, stocking_date, initial_quantity, initial_avg_weight, purchase_cost, status) VALUES
  (1,  1, 2, '2026-04-10', 3000, 25.00,  9000.00, 'completed'),
  (2,  1, 3, '2026-04-10', 1500, 30.00,  6000.00, 'completed'),
  (3,  2, 1, '2026-06-15', 5000,  5.00,  7500.00, 'harvesting'),
  (4,  3, 4, '2026-05-01', 4000, 15.00, 16000.00, 'harvesting'),
  (5,  3, 5, '2026-09-01', 2000, 20.00,  6000.00, 'active'),
  (6,  4, 6, '2026-03-20', 2500, 20.00,  7500.00, 'completed'),
  (7,  5, 2, '2026-07-05', 3500, 25.00, 10500.00, 'active'),
  (8,  5, 1, '2026-07-05', 4000,  5.00,  6000.00, 'active'),
  (9,  7, 3, '2026-08-10', 3000, 30.00, 12000.00, 'active'),
  (10, 7, 4, '2026-09-20', 2500, 15.00, 10000.00, 'active'),
  (11, 8, 2, '2026-10-01', 6000, 20.00, 18000.00, 'active'),
  (12, 8, 5, '2026-10-05', 3000, 20.00,  9000.00, 'active'),
  (13, 1, 1, '2026-10-15', 4000,  5.00,  6000.00, 'active');

  
-- ---------- SECTION 2: daily operations + money data ----------

-- Feed logs (batches 12 and 13 intentionally have none)
INSERT INTO feed_logs (batch_id, feed_date, feed_type, quantity_kg, cost) VALUES
  (1,  '2026-04-15', 'Starter',  120.00,  8400.00),
  (1,  '2026-05-10', 'Starter',  200.00, 14000.00),
  (1,  '2026-06-05', 'Grower',   300.00, 18600.00),
  (1,  '2026-07-01', 'Grower',   350.00, 21700.00),
  (1,  '2026-07-25', 'Finisher', 300.00, 17400.00),
  (1,  '2026-08-10', 'Finisher', 250.00, 14500.00),
  (2,  '2026-04-20', 'Starter',   60.00,  4200.00),
  (2,  '2026-05-20', 'Grower',   150.00,  9300.00),
  (2,  '2026-06-25', 'Grower',   200.00, 12400.00),
  (2,  '2026-08-01', 'Finisher', 180.00, 10440.00),
  (3,  '2026-06-20', 'Starter',  150.00, 10500.00),
  (3,  '2026-07-20', 'Starter',  250.00, 17500.00),
  (3,  '2026-08-25', 'Grower',   400.00, 24800.00),
  (3,  '2026-09-30', 'Grower',   350.00, 21700.00),
  (3,  '2026-10-15', 'Finisher', 200.00, 11600.00),
  (4,  '2026-05-06', 'Starter',  150.00, 10500.00),
  (4,  '2026-06-10', 'Grower',   400.00, 24800.00),
  (4,  '2026-07-15', 'Grower',   500.00, 31000.00),
  (4,  '2026-08-20', 'Finisher', 500.00, 29000.00),
  (4,  '2026-09-25', 'Finisher', 450.00, 26100.00),
  (4,  '2026-10-20', 'Finisher', 900.00, 52200.00),
  (5,  '2026-09-05', 'Starter',   50.00,  3500.00),
  (5,  '2026-10-05', 'Starter',   80.00,  5600.00),
  (5,  '2026-10-28', 'Grower',    90.00,  5580.00),
  (6,  '2026-03-25', 'Starter',  100.00,  7000.00),
  (6,  '2026-04-25', 'Starter',  150.00, 10500.00),
  (6,  '2026-05-30', 'Grower',   250.00, 15500.00),
  (6,  '2026-06-30', 'Grower',   250.00, 15500.00),
  (6,  '2026-07-15', 'Finisher', 200.00, 11600.00),
  (7,  '2026-07-10', 'Starter',  120.00,  8400.00),
  (7,  '2026-08-10', 'Starter',  200.00, 14000.00),
  (7,  '2026-09-10', 'Grower',   300.00, 18600.00),
  (7,  '2026-10-12', 'Grower',   350.00, 21700.00),
  (7,  '2026-10-30', 'Grower',   200.00, 12400.00),
  (8,  '2026-07-10', 'Starter',  150.00, 10500.00),
  (8,  '2026-08-12', 'Starter',  250.00, 17500.00),
  (8,  '2026-09-15', 'Grower',   350.00, 21700.00),
  (8,  '2026-10-20', 'Grower',   300.00, 18600.00),
  (9,  '2026-08-15', 'Starter',   80.00,  5600.00),
  (9,  '2026-09-15', 'Grower',   200.00, 12400.00),
  (9,  '2026-10-18', 'Grower',   220.00, 13640.00),
  (10, '2026-09-25', 'Starter',  100.00,  7000.00),
  (10, '2026-10-15', 'Starter',  180.00, 12600.00),
  (10, '2026-11-01', 'Grower',   200.00, 12400.00),
  (11, '2026-10-05', 'Starter',  100.00,  7000.00),
  (11, '2026-10-25', 'Starter',  150.00, 10500.00);

-- Water readings (NULL = not measured; ponds 6, 8, 9 intentionally have none)
INSERT INTO water_readings (pond_id, recorded_at, ph, dissolved_oxygen, temperature, notes) VALUES
  (1, '2026-10-22 06:00:00', 7.40, 5.80, 27.50, NULL),
  (1, '2026-10-26 06:00:00', 7.20, NULL, 27.00, NULL),
  (1, '2026-10-30 06:00:00', 7.60, 3.10, 26.00, 'Low DO at dawn'),
  (1, '2026-11-02 06:00:00', 7.50, 5.20, 26.50, NULL),
  (2, '2026-10-21 07:00:00', 7.10, 5.50, 28.00, NULL),
  (2, '2026-10-27 07:00:00', 5.90, 5.00, 27.50, 'pH low after rain'),
  (2, '2026-11-01 07:00:00', 6.80, NULL, 27.00, NULL),
  (2, '2026-11-03 07:00:00', 7.00, 5.10, 26.50, NULL),
  (3, '2026-10-20 06:30:00', 7.80, 6.20, 28.50, NULL),
  (3, '2026-10-24 06:30:00', 7.90, 2.80, 29.00, 'DO very low'),
  (3, '2026-10-28 06:30:00', NULL, 4.90, 28.00, 'pH meter unavailable'),
  (3, '2026-11-02 06:30:00', 7.70, 5.60, 27.50, NULL),
  (4, '2026-10-23 08:00:00', 7.00, NULL, 18.50, 'Cold morning'),
  (4, '2026-10-30 08:00:00', 7.10, 6.00, 24.00, NULL),
  (5, '2026-10-21 06:00:00', 7.30, 5.40, 27.00, NULL),
  (5, '2026-10-25 06:00:00', 9.20, 6.00, 28.00, 'High pH'),
  (5, '2026-10-29 06:00:00', 7.50, 5.70, 27.50, NULL),
  (5, '2026-11-03 06:00:00', 7.40, NULL, 27.00, NULL),
  (5, '2026-11-03 18:00:00', NULL, NULL, 29.50, 'Temperature only'),
  (7, '2026-10-22 06:00:00', 7.60, 3.40, 34.20, 'Hot and low DO'),
  (7, '2026-10-28 06:00:00', 7.50, 4.80, 30.00, NULL),
  (7, '2026-11-01 06:00:00', 7.70, NULL, 29.00, NULL),
  (7, '2026-11-03 06:00:00', 7.60, 5.00, 28.50, NULL);

-- Disease and mortality records
INSERT INTO disease_cases (batch_id, incident_date, symptoms, affected_quantity, dead_quantity, action_taken) VALUES
  (6, '2026-05-02', 'Sluggish swimming',                50,  6, 'Reduced feeding'),
  (1, '2026-06-12', 'Fish floating near surface',       80, 10, 'Increased aeration'),
  (4, '2026-07-18', 'White spots on skin',             200, 35, 'Reduced feeding and consulted Fisheries Officer'),
  (3, '2026-08-05', 'Gill redness and surface gasping', 120, 15, 'Improved aeration and partial water exchange'),
  (7, '2026-09-22', 'Loss of appetite',                 60,  8, 'Reduced feeding; water checked'),
  (8, '2026-09-28', 'Slow movement',                    40,  0, 'Monitoring; no deaths recorded'),
  (9, '2026-10-02', 'Red spots on body',                90, 12, 'Consulted Fisheries Officer'),
  (10,'2026-10-12', 'Fin damage',                       30,  5, 'Handled carefully and observed');

-- Harvests (partial harvesting; harvest 9 has no sales yet)
INSERT INTO harvests (harvest_id, batch_id, harvest_date, quantity_kg, average_weight, notes) VALUES
  (1, 1, '2026-08-20', 700.00, 520.00, 'First partial harvest'),
  (2, 1, '2026-09-15', 600.00, 560.00, 'Final harvest'),
  (3, 2, '2026-08-22', 500.00, 640.00, 'First partial harvest'),
  (4, 2, '2026-09-18', 350.00, 700.00, 'Final harvest'),
  (5, 6, '2026-07-25', 560.00, 480.00, 'First partial harvest'),
  (6, 6, '2026-08-30', 480.00, 500.00, 'Final harvest'),
  (7, 3, '2026-10-25', 300.00, 420.00, 'First partial harvest'),
  (8, 4, '2026-10-28', 800.00, 950.00, 'First partial harvest'),
  (9, 4, '2026-11-02', 500.00, 1000.00, 'Second partial harvest');

-- Sales (several harvests are sold to more than one buyer; payment statuses vary)
INSERT INTO sales (harvest_id, buyer_name, sale_date, quantity_kg, price_per_kg, payment_status) VALUES
  (1, 'Hasan Traders',      '2026-08-20', 300.00, 220.00, 'paid'),
  (1, 'Dhaka Fish Co',      '2026-08-21', 250.00, 215.00, 'paid'),
  (1, 'Sultana Enterprise', '2026-08-22', 150.00, 210.00, 'unpaid'),
  (2, 'Hasan Traders',      '2026-09-15', 400.00, 225.00, 'paid'),
  (2, 'Rafiq & Sons',       '2026-09-16', 150.00, 220.00, 'paid'),
  (3, 'Dhaka Fish Co',      '2026-08-22', 300.00, 240.00, 'paid'),
  (3, 'City Hotel Supply',  '2026-08-23', 200.00, 235.00, 'unpaid'),
  (4, 'Hasan Traders',      '2026-09-18', 350.00, 230.00, 'paid'),
  (5, 'Bogura Aratdar',     '2026-07-25', 300.00, 180.00, 'paid'),
  (5, 'Rafiq & Sons',       '2026-07-26', 200.00, 175.00, 'paid'),
  (6, 'Bogura Aratdar',     '2026-08-30', 280.00, 175.00, 'paid'),
  (6, 'Local Market',       '2026-08-31', 200.00, 170.00, 'unpaid'),
  (7, 'Karim Fish House',   '2026-10-26', 120.00, 160.00, 'paid'),
  (7, 'Local Market',       '2026-10-27', 100.00, 155.00, 'unpaid'),
  (8, 'City Hotel Supply',  '2026-10-29', 400.00, 150.00, 'paid'),
  (8, 'Sultana Enterprise', '2026-10-30', 200.00, 145.00, 'unpaid');

-- Other operational expenses (batches 12 and 13 intentionally have none)
INSERT INTO other_expenses (batch_id, expense_date, expense_type, description, amount) VALUES
  (1,  '2026-04-08', 'Pond Preparation', 'Lime and pond drying',        4500.00),
  (1,  '2026-05-15', 'Labor',            'Monthly pond caretaker',      6000.00),
  (1,  '2026-06-15', 'Labor',            'Monthly pond caretaker',      6000.00),
  (1,  '2026-08-18', 'Transportation',   'Fish carrying to market',     3500.00),
  (2,  '2026-04-08', 'Pond Preparation', 'Shared pond preparation',     2500.00),
  (2,  '2026-07-10', 'Medicine',         'Preventive treatment',        1800.00),
  (3,  '2026-06-10', 'Pond Preparation', 'Lime and fertilizer',         3000.00),
  (3,  '2026-07-15', 'Electricity',      'Aerator power',               2400.00),
  (3,  '2026-08-15', 'Electricity',      'Aerator power',               2600.00),
  (3,  '2026-09-15', 'Electricity',      'Aerator power',               2700.00),
  (3,  '2026-10-24', 'Transportation',   'Harvest transport',           2000.00),
  (4,  '2026-04-28', 'Pond Preparation', 'Lime and fertilizer',         5000.00),
  (4,  '2026-07-20', 'Medicine',         'Disease treatment',           4200.00),
  (4,  '2026-08-20', 'Electricity',      'Aerator power',               3800.00),
  (4,  '2026-09-20', 'Labor',            'Netting crew',                7500.00),
  (4,  '2026-10-27', 'Transportation',   'Harvest transport',           4500.00),
  (5,  '2026-08-30', 'Pond Preparation', 'Pond cleaning',               2000.00),
  (5,  '2026-10-02', 'Other',            'Net purchase',                1200.00),
  (6,  '2026-03-18', 'Pond Preparation', 'Lime and fertilizer',         3500.00),
  (6,  '2026-06-20', 'Labor',            'Monthly pond caretaker',      5000.00),
  (6,  '2026-07-24', 'Transportation',   'Fish carrying to market',     3000.00),
  (7,  '2026-07-01', 'Pond Preparation', 'Lime and fertilizer',         3200.00),
  (7,  '2026-09-05', 'Electricity',      'Aerator power',               2200.00),
  (7,  '2026-10-05', 'Electricity',      'Aerator power',               2300.00),
  (8,  '2026-08-05', 'Medicine',         'Fish health tonic',           1500.00),
  (9,  '2026-08-08', 'Pond Preparation', 'Lime and fertilizer',         4000.00),
  (9,  '2026-10-10', 'Maintenance',      'Embankment repair',           3500.00),
  (10, '2026-09-18', 'Pond Preparation', 'Lime',                        1500.00),
  (11, '2026-09-28', 'Pond Preparation', 'Pond drying and lime',        5500.00),
  (11, '2026-10-20', 'Labor',            'Caretaker advance',           3000.00);