-- ============================================================
-- Pukur Pulse — views.sql  (safe to re-run)
-- ============================================================
USE pukur_pulse;

-- [Syllabus #37 CREATE VIEW] pond-wise feed expense summary
CREATE OR REPLACE VIEW v_pond_feed_expense_summary AS
SELECT
  p.pond_id,
  p.user_id,
  p.pond_name,
  COUNT(fl.feed_id)                AS feed_entries,
  COALESCE(SUM(fl.quantity_kg), 0) AS total_feed_kg,
  COALESCE(SUM(fl.cost), 0)        AS total_feed_cost
FROM ponds p
LEFT JOIN stocking_batches b ON b.pond_id = p.pond_id
LEFT JOIN feed_logs fl       ON fl.batch_id = b.batch_id
GROUP BY p.pond_id, p.user_id, p.pond_name;

-- Batch financial summary. Feed, expenses and sales are each summed ALONE in a
-- subquery and only then joined, so one-to-many JOINs cannot double-count money.
CREATE OR REPLACE VIEW v_batch_financial_summary AS
SELECT
  b.batch_id,
  b.pond_id,
  p.user_id,
  p.pond_name,
  sp.species_name,
  b.status,
  b.purchase_cost,
  COALESCE(fd.feed_cost, 0)     AS feed_cost,
  COALESCE(ex.other_expense, 0) AS other_expense,
  b.purchase_cost + COALESCE(fd.feed_cost, 0) + COALESCE(ex.other_expense, 0) AS total_cost,
  COALESCE(sl.revenue, 0)       AS total_revenue,
  COALESCE(sl.revenue, 0)
    - (b.purchase_cost + COALESCE(fd.feed_cost, 0) + COALESCE(ex.other_expense, 0)) AS estimated_recorded_profit
FROM stocking_batches b
JOIN ponds p         ON p.pond_id = b.pond_id
JOIN fish_species sp ON sp.species_id = b.species_id
LEFT JOIN (SELECT batch_id, SUM(cost) AS feed_cost FROM feed_logs GROUP BY batch_id) fd
       ON fd.batch_id = b.batch_id
LEFT JOIN (SELECT batch_id, SUM(amount) AS other_expense FROM expenses GROUP BY batch_id) ex
       ON ex.batch_id = b.batch_id
LEFT JOIN (SELECT batch_id, ROUND(SUM(quantity_kg * price_per_kg), 2) AS revenue FROM sales GROUP BY batch_id) sl
       ON sl.batch_id = b.batch_id;
