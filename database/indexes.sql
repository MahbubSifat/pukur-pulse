-- ============================================================
-- Pukur Pulse — indexes.sql  (run ONCE, as ADMIN)
-- Each index is (parent column, date column): "records of one pond/batch, by date".
-- ============================================================
USE pukur_pulse;

CREATE INDEX idx_water_pond_recorded ON water_readings (pond_id, recorded_at);
CREATE INDEX idx_feed_batch_date     ON feed_logs      (batch_id, feed_date);
CREATE INDEX idx_disease_batch_date  ON disease_cases  (batch_id, incident_date);
CREATE INDEX idx_harvest_batch_date  ON harvests       (batch_id, harvest_date);
CREATE INDEX idx_sales_harvest_date  ON sales          (harvest_id, sale_date);
CREATE INDEX idx_expense_batch_date  ON other_expenses (batch_id, expense_date);