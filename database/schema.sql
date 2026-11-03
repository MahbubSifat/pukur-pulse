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