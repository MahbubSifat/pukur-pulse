import { query } from "@/lib/db";

// Each number comes from its own query on one table (or a view that already
// aggregates alone), so JOINs can never multiply the totals.
export async function getDashboardStats(userId) {
  const [ponds] = await query("SELECT COUNT(*) AS n FROM ponds WHERE user_id = ?", [userId]);
  const [batches] = await query(
    `SELECT COALESCE(SUM(b.status = 'active'), 0) AS activeBatches, COALESCE(SUM(b.initial_quantity), 0) AS totalFish
     FROM stocking_batches b JOIN ponds p ON p.pond_id = b.pond_id WHERE p.user_id = ?`,
    [userId]
  );
  const [feed] = await query(
    "SELECT COALESCE(SUM(total_feed_kg), 0) AS feedKg, COALESCE(SUM(total_feed_cost), 0) AS feedCost FROM v_pond_feed_expense_summary WHERE user_id = ?",
    [userId]
  );
  const [harvest] = await query(
    `SELECT COALESCE(SUM(h.quantity_kg), 0) AS harvestKg
     FROM harvests h JOIN stocking_batches b ON b.batch_id = h.batch_id JOIN ponds p ON p.pond_id = b.pond_id WHERE p.user_id = ?`,
    [userId]
  );
  const [money] = await query(
    `SELECT COALESCE(SUM(total_cost), 0) AS totalCost, COALESCE(SUM(total_revenue), 0) AS revenue,
            COALESCE(SUM(estimated_recorded_profit), 0) AS profit
     FROM v_batch_financial_summary WHERE user_id = ?`,
    [userId]
  );
  return {
    totalPonds: ponds.n,
    activeBatches: Number(batches.activeBatches),
    totalFish: Number(batches.totalFish),
    feedKg: Number(feed.feedKg),
    feedCost: Number(feed.feedCost),
    harvestKg: Number(harvest.harvestKg),
    totalCost: Number(money.totalCost),
    revenue: Number(money.revenue),
    profit: Number(money.profit),
  };

}


// ---------- charts (all numbers come from the logged-in user's own records) ----------
export async function getChartData(userId) {
  const feedMonthly = await query(
    `SELECT DATE_FORMAT(f.feed_date, '%Y-%m') AS ym, SUM(f.cost) AS total
     FROM feed_logs f JOIN stocking_batches b ON b.batch_id = f.batch_id JOIN ponds p ON p.pond_id = b.pond_id
     WHERE p.user_id = ? GROUP BY DATE_FORMAT(f.feed_date, '%Y-%m') ORDER BY ym`,
    [userId]
  );
  const salesMonthly = await query(
    `SELECT DATE_FORMAT(s.sale_date, '%Y-%m') AS ym, ROUND(SUM(s.quantity_kg * s.price_per_kg), 2) AS total
     FROM sales s JOIN stocking_batches b ON b.batch_id = s.batch_id JOIN ponds p ON p.pond_id = b.pond_id
     WHERE p.user_id = ? GROUP BY DATE_FORMAT(s.sale_date, '%Y-%m') ORDER BY ym`,
    [userId]
  );
  const water = await query(
    `SELECT w.pond_id AS pondId, p.pond_name AS pondName, w.recorded_at AS recordedAt,
            w.ph, w.dissolved_oxygen AS dissolvedOxygen, w.temperature
     FROM water_readings w JOIN ponds p ON p.pond_id = w.pond_id
     WHERE p.user_id = ? ORDER BY w.recorded_at DESC LIMIT 60`,
    [userId]
  );
  const num = (r) => ({ month: r.ym, total: Number(r.total) });
  return { feedMonthly: feedMonthly.map(num), salesMonthly: salesMonthly.map(num), water: water.reverse() };
}