-- ============================================================
-- Pukur Pulse — schema.sql
-- Run as an ADMIN account (root). The app user (pukur_app) has no CREATE right on purpose.
-- ============================================================
USE pukur_pulse;

-- ---------- PART 1: core structure tables ----------

-- TABLE 1: farmers
CREATE TABLE farmers (
  farmer_id  INT AUTO_INCREMENT PRIMARY KEY,
  full_name  VARCHAR(100) NOT NULL,
  phone      VARCHAR(20)  NULL,
  address    VARCHAR(255) NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_farmers_phone UNIQUE (phone)
) ENGINE=InnoDB;

-- TABLE 2: app_users (login accounts: farmer or officer)
CREATE TABLE app_users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id     INT          NULL,
  username      VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(30)  NOT NULL,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_app_users_farmer   UNIQUE (farmer_id),
  CONSTRAINT uq_app_users_username UNIQUE (username),
  CONSTRAINT fk_app_users_farmer   FOREIGN KEY (farmer_id)
    REFERENCES farmers (farmer_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_app_users_role CHECK (role IN ('farmer', 'officer')),
  CONSTRAINT chk_app_users_role_profile CHECK (
    (role = 'farmer'  AND farmer_id IS NOT NULL) OR
    (role = 'officer' AND farmer_id IS NULL)
  )
) ENGINE=InnoDB;

-- TABLE 3: fish_species
CREATE TABLE fish_species (
  species_id   INT AUTO_INCREMENT PRIMARY KEY,
  species_name VARCHAR(100) NOT NULL,
  description  TEXT         NULL,
  CONSTRAINT uq_fish_species_name UNIQUE (species_name)
) ENGINE=InnoDB;

-- TABLE 4: ponds
CREATE TABLE ponds (
  pond_id      INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id    INT           NOT NULL,
  pond_name    VARCHAR(100)  NOT NULL,
  area_decimal DECIMAL(10,2) NOT NULL,
  water_type   VARCHAR(30)   NULL,
  location     VARCHAR(255)  NULL,
  status       VARCHAR(20)   NOT NULL DEFAULT 'active',
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_ponds_farmer_name UNIQUE (farmer_id, pond_name),
  CONSTRAINT fk_ponds_farmer FOREIGN KEY (farmer_id)
    REFERENCES farmers (farmer_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_ponds_area   CHECK (area_decimal > 0),
  CONSTRAINT chk_ponds_status CHECK (status IN ('active', 'maintenance', 'inactive'))
) ENGINE=InnoDB;

-- TABLE 5: stocking_batches (central table)
CREATE TABLE stocking_batches (
  batch_id           INT AUTO_INCREMENT PRIMARY KEY,
  pond_id            INT           NOT NULL,
  species_id         INT           NOT NULL,
  stocking_date      DATE          NOT NULL,
  initial_quantity   INT           NOT NULL,
  initial_avg_weight DECIMAL(8,2)  NULL COMMENT 'grams per fish',
  purchase_cost      DECIMAL(12,2) NOT NULL,
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

-- ---------- PART 2 (6 operations tables) will be added below in the next step ----------
-- ---------- PART 2: daily operations + money tables ----------
USE pukur_pulse;

-- TABLE 6: feed_logs
CREATE TABLE feed_logs (
  feed_id     INT AUTO_INCREMENT PRIMARY KEY,
  batch_id    INT           NOT NULL,
  feed_date   DATE          NOT NULL,
  feed_type   VARCHAR(100)  NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  cost        DECIMAL(12,2) NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feed_batch FOREIGN KEY (batch_id)
    REFERENCES stocking_batches (batch_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_feed_quantity CHECK (quantity_kg > 0),
  CONSTRAINT chk_feed_cost     CHECK (cost >= 0)
) ENGINE=InnoDB;

-- TABLE 7: water_readings (a missing measurement is stored as NULL, never 0)
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
  CONSTRAINT chk_water_do   CHECK (dissolved_oxygen IS NULL OR dissolved_oxygen >= 0),
  CONSTRAINT chk_water_temp CHECK (temperature IS NULL OR temperature >= 0),
  CONSTRAINT chk_water_has_measurement CHECK (
    ph IS NOT NULL OR dissolved_oxygen IS NOT NULL OR temperature IS NOT NULL
  )
) ENGINE=InnoDB;

-- TABLE 8: disease_cases
CREATE TABLE disease_cases (
  case_id           INT AUTO_INCREMENT PRIMARY KEY,
  batch_id          INT      NOT NULL,
  incident_date     DATE     NOT NULL,
  symptoms          TEXT     NULL,
  affected_quantity INT      NOT NULL DEFAULT 0,
  dead_quantity     INT      NOT NULL DEFAULT 0,
  action_taken      TEXT     NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_disease_batch FOREIGN KEY (batch_id)
    REFERENCES stocking_batches (batch_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_disease_affected CHECK (affected_quantity >= 0),
  CONSTRAINT chk_disease_dead     CHECK (dead_quantity >= 0),
  CONSTRAINT chk_disease_dead_le_affected CHECK (dead_quantity <= affected_quantity)
) ENGINE=InnoDB;

-- TABLE 9: harvests (partial harvesting: many rows per batch)
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

-- TABLE 10: sales (sale amount is NOT stored; it is calculated as quantity_kg * price_per_kg)
CREATE TABLE sales (
  sale_id        INT AUTO_INCREMENT PRIMARY KEY,
  harvest_id     INT           NOT NULL,
  buyer_name     VARCHAR(100)  NOT NULL,
  sale_date      DATE          NOT NULL,
  quantity_kg    DECIMAL(10,2) NOT NULL,
  price_per_kg   DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20)   NOT NULL DEFAULT 'unpaid',
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sales_harvest FOREIGN KEY (harvest_id)
    REFERENCES harvests (harvest_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_sales_quantity CHECK (quantity_kg > 0),
  CONSTRAINT chk_sales_price    CHECK (price_per_kg >= 0),
  CONSTRAINT chk_sales_payment  CHECK (payment_status IN ('paid', 'unpaid'))
) ENGINE=InnoDB;

-- TABLE 11: other_expenses
CREATE TABLE other_expenses (
  expense_id   INT AUTO_INCREMENT PRIMARY KEY,
  batch_id     INT           NOT NULL,
  expense_date DATE          NOT NULL,
  expense_type VARCHAR(100)  NOT NULL,
  description  TEXT          NULL,
  amount       DECIMAL(12,2) NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_batch FOREIGN KEY (batch_id)
    REFERENCES stocking_batches (batch_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_expenses_amount CHECK (amount >= 0)
) ENGINE=InnoDB;