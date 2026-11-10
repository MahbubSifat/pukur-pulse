-- ============================================================
-- Pukur Pulse — indexes.sql  (run ONCE, after schema.sql)
-- Each index = (parent column, date column): "records of one pond/batch, by date".
-- ============================================================
USE pukur_pulse;

-- [Syllabus #45 CREATE INDEX]
CREATE INDEX idx_water_pond_recorded ON water_readings (pond_id, recorded_at);
CREATE INDEX idx_feed_batch_date     ON feed_logs      (batch_id, feed_date);
CREATE INDEX idx_harvest_batch_date  ON harvests       (batch_id, harvest_date);
CREATE INDEX idx_sales_batch_date    ON sales          (batch_id, sale_date);
CREATE INDEX idx_expense_batch_date  ON expenses       (batch_id, expense_date);
