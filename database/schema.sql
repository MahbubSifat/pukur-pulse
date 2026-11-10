-- ============================================================
-- Pukur Pulse — schema.sql   (run as MySQL admin/root)
-- Creates the database, the 9 tables, and a least-privilege app user.
-- ============================================================

-- Re-runnable: start from a clean database (this also removes tables of the old bigger version)
DROP DATABASE IF EXISTS pukur_pulse;
CREATE DATABASE pukur_pulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pukur_pulse;

-- [Syllabus #2 CREATE TABLE | #32 PRIMARY KEY | #34 UNIQUE] TABLE 1: users
CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT uq_users_phone UNIQUE (phone)
) ENGINE=InnoDB;

-- TABLE 2: ponds   [#33 FOREIGN KEY | #35 CHECK | #36 Referential Integrity]
CREATE TABLE ponds (
  pond_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT           NOT NULL,
  pond_name    VARCHAR(100)  NOT NULL,
  area_decimal DECIMAL(10,2) NOT NULL,
  water_type   VARCHAR(30)   NULL,
  location     VARCHAR(255)  NULL,
  status       VARCHAR(20)   NOT NULL DEFAULT 'active',
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_ponds_user_name UNIQUE (user_id, pond_name),
  CONSTRAINT fk_ponds_user FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_ponds_area   CHECK (area_decimal > 0),
  CONSTRAINT chk_ponds_status CHECK (status IN ('active', 'maintenance', 'inactive'))
) ENGINE=InnoDB;

-- TABLE 3: fish_species
CREATE TABLE fish_species (
  species_id   INT AUTO_INCREMENT PRIMARY KEY,
  species_name VARCHAR(100) NOT NULL,
  CONSTRAINT uq_fish_species_name UNIQUE (species_name)
) ENGINE=InnoDB;

-- TABLE 4: stocking_batches
CREATE TABLE stocking_batches (
  batch_id           INT AUTO_INCREMENT PRIMARY KEY,
  pond_id            INT           NOT NULL,
  species_id         INT           NOT NULL,
  stocking_date      DATE          NOT NULL,
  initial_quantity   INT           NOT NULL,
  initial_avg_weight DECIMAL(8,2)  NULL COMMENT 'grams per fish',
  purchase_cost      DECIMAL(12,2) NOT NULL DEFAULT 0,
  status             VARCHAR(20)   NOT NULL DEFAULT 'active',
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_batches_pond FOREIGN KEY (pond_id)
    REFERENCES ponds (pond_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_batches_species FOREIGN KEY (species_id)
    REFERENCES fish_species (species_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_batches_quantity CHECK (initial_quantity > 0),
  CONSTRAINT chk_batches_weight   CHECK (initial_avg_weight IS NULL OR initial_avg_weight > 0),
  CONSTRAINT chk_batches_cost     CHECK (purchase_cost >= 0),
  CONSTRAINT chk_batches_status   CHECK (status IN ('active', 'harvesting', 'completed'))
) ENGINE=InnoDB;

-- TABLE 5: feed_logs
CREATE TABLE feed_logs (
  feed_id     INT AUTO_INCREMENT PRIMARY KEY,
  batch_id    INT           NOT NULL,
  feed_date   DATE          NOT NULL,
  feed_type   VARCHAR(100)  NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  cost        DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feed_batch FOREIGN KEY (batch_id)
    REFERENCES stocking_batches (batch_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_feed_quantity CHECK (quantity_kg > 0),
  CONSTRAINT chk_feed_cost     CHECK (cost >= 0)
) ENGINE=InnoDB;

-- TABLE 6: water_readings  (a missing measurement is NULL, never 0)
CREATE TABLE water_readings (
  reading_id       INT AUTO_INCREMENT PRIMARY KEY,
  pond_id          INT          NOT NULL,
  recorded_at      DATETIME     NOT NULL,
  ph               DECIMAL(4,2) NULL,
  dissolved_oxygen DECIMAL(5,2) NULL COMMENT 'mg/L',
  temperature      DECIMAL(5,2) NULL COMMENT 'degrees Celsius',
  notes            TEXT         NULL,
  CONSTRAINT fk_water_pond FOREIGN KEY (pond_id)
    REFERENCES ponds (pond_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_water_ph   CHECK (ph IS NULL OR (ph >= 0 AND ph <= 14)),
  CONSTRAINT chk_water_do   CHECK (dissolved_oxygen IS NULL OR (dissolved_oxygen >= 0 AND dissolved_oxygen <= 30)),
  CONSTRAINT chk_water_temp CHECK (temperature IS NULL OR (temperature >= 0 AND temperature <= 50)),
  CONSTRAINT chk_water_has_measurement CHECK (
    ph IS NOT NULL OR dissolved_oxygen IS NOT NULL OR temperature IS NOT NULL
  )
) ENGINE=InnoDB;

-- TABLE 7: harvests (many partial harvests per batch)
CREATE TABLE harvests (
  harvest_id     INT AUTO_INCREMENT PRIMARY KEY,
  batch_id       INT           NOT NULL,
  harvest_date   DATE          NOT NULL,
  quantity_kg    DECIMAL(10,2) NOT NULL,
  average_weight DECIMAL(8,2)  NULL COMMENT 'grams per fish',
  notes          TEXT          NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_harvest_batch FOREIGN KEY (batch_id)
    REFERENCES stocking_batches (batch_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_harvest_quantity CHECK (quantity_kg > 0),
  CONSTRAINT chk_harvest_weight   CHECK (average_weight IS NULL OR average_weight > 0)
) ENGINE=InnoDB;

-- TABLE 8: sales  (sale amount is NOT stored: quantity_kg * price_per_kg)
CREATE TABLE sales (
  sale_id        INT AUTO_INCREMENT PRIMARY KEY,
  batch_id       INT           NOT NULL,
  buyer_name     VARCHAR(100)  NOT NULL,
  sale_date      DATE          NOT NULL,
  quantity_kg    DECIMAL(10,2) NOT NULL,
  price_per_kg   DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20)   NOT NULL DEFAULT 'unpaid',
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sales_batch FOREIGN KEY (batch_id)
    REFERENCES stocking_batches (batch_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_sales_quantity CHECK (quantity_kg > 0),
  CONSTRAINT chk_sales_price    CHECK (price_per_kg >= 0),
  CONSTRAINT chk_sales_payment  CHECK (payment_status IN ('paid', 'unpaid'))
) ENGINE=InnoDB;

-- TABLE 9: expenses (other expenses; purchase cost and feed cost live in their own tables)
CREATE TABLE expenses (
  expense_id   INT AUTO_INCREMENT PRIMARY KEY,
  batch_id     INT           NOT NULL,
  expense_date DATE          NOT NULL,
  expense_type VARCHAR(100)  NOT NULL,
  description  TEXT          NULL,
  amount       DECIMAL(12,2) NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_batch FOREIGN KEY (batch_id)
    REFERENCES stocking_batches (batch_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_expenses_amount CHECK (amount >= 0),
  CONSTRAINT chk_expenses_type   CHECK (expense_type IN ('Labor', 'Electricity', 'Maintenance', 'Transportation', 'Other'))
) ENGINE=InnoDB;

-- ---------- Application DB user: normal rights only, NO admin rights ----------
-- Development password (do NOT use # in it: .env files treat # as a comment). Change it in any real deployment and keep it in .env.local.
CREATE USER IF NOT EXISTS 'pukur_app'@'localhost' IDENTIFIED BY 'PukurApp_2026';
GRANT SELECT, INSERT, UPDATE, DELETE ON pukur_pulse.* TO 'pukur_app'@'localhost';
