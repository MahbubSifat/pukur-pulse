-- ============================================================
-- Pukur Pulse — views.sql  (safe to re-run: CREATE OR REPLACE)
-- Run as ADMIN (root). pukur_app can read these through its SELECT right.
-- ============================================================
USE pukur_pulse;

-- VIEW 1: pond-wise feed expense summary (syllabus #37 CREATE VIEW)
CREATE OR REPLACE VIEW v_pond_feed_expense_summary AS
SELECT
  p.pond_id,
  p.farmer_id,
  p.pond_name,
  f.full_name                      AS farmer_name,
  COUNT(fl.feed_id)                AS feed_entries,
  COALESCE(SUM(fl.quantity_kg), 0) AS total_feed_kg,
  COALESCE(SUM(fl.cost), 0)        AS total_feed_cost
FROM ponds p
JOIN farmers f ON f.farmer_id = p.farmer_id
LEFT JOIN stocking_batches b ON b.pond_id = p.pond_id
LEFT JOIN feed_logs fl       ON fl.batch_id = b.batch_id
GROUP BY p.pond_id, p.farmer_id, p.pond_name, f.full_name;

-- VIEW 2: how much of each harvest is sold and how much is still available
CREATE OR REPLACE VIEW v_harvest_availability AS
SELECT
  h.harvest_id,
  h.batch_id,
  h.harvest_date,
  h.quantity_kg                                       AS harvested_kg,
  COALESCE(SUM(s.quantity_kg), 0)                     AS sold_kg,
  h.quantity_kg - COALESCE(SUM(s.quantity_kg), 0)     AS remaining_kg
FROM harvests h
LEFT JOIN sales s ON s.harvest_id = h.harvest_id
GROUP BY h.harvest_id, h.batch_id, h.harvest_date, h.quantity_kg;

-- VIEW 3: batch-wise financial summary.
-- Each money source (feed, other expenses, sales) is summed ALONE in its own
-- subquery, and only the small summaries are joined. This avoids row multiplication.
CREATE OR REPLACE VIEW v_batch_financial_summary AS
SELECT
  b.batch_id,
  b.pond_id,
  p.farmer_id,
  p.pond_name,
  sp.species_name,
  b.status,
  b.purchase_cost,
  COALESCE(fd.feed_cost, 0)     AS feed_cost,
  COALESCE(ex.other_expense, 0) AS other_expense,
  b.purchase_cost + COALESCE(fd.feed_cost, 0) + COALESCE(ex.other_expense, 0) AS total_cost,
  COALESCE(rv.revenue, 0)       AS total_revenue,
  COALESCE(rv.revenue, 0)
    - (b.purchase_cost + COALESCE(fd.feed_cost, 0) + COALESCE(ex.other_expense, 0))
                                AS estimated_recorded_profit
FROM stocking_batches b
JOIN ponds p         ON p.pond_id = b.pond_id
JOIN fish_species sp ON sp.species_id = b.species_id
LEFT JOIN (SELECT batch_id, SUM(cost) AS feed_cost
           FROM feed_logs GROUP BY batch_id) fd ON fd.batch_id = b.batch_id
LEFT JOIN (SELECT batch_id, SUM(amount) AS other_expense
           FROM other_expenses GROUP BY batch_id) ex ON ex.batch_id = b.batch_id
LEFT JOIN (SELECT h.batch_id, ROUND(SUM(s.quantity_kg * s.price_per_kg), 2) AS revenue
           FROM harvests h JOIN sales s ON s.harvest_id = h.harvest_id
           GROUP BY h.batch_id) rv ON rv.batch_id = b.batch_id;