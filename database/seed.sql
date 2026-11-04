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