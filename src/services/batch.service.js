import { query } from "@/lib/db";
import { FieldError } from "@/lib/utils";
import { BATCH_STATUSES } from "@/lib/validations";

// Ownership chain: users -> ponds -> stocking_batches. Checked in SQL, not in the browser.
const BATCH_SELECT = `
  SELECT b.batch_id AS batchId, b.pond_id AS pondId, p.pond_name AS pondName,
         b.species_id AS speciesId, s.species_name AS speciesName,
         b.stocking_date AS stockingDate, b.initial_quantity AS initialQuantity,
         b.initial_avg_weight AS initialAvgWeight, b.purchase_cost AS purchaseCost, b.status
  FROM stocking_batches b
  JOIN ponds p        ON p.pond_id = b.pond_id
  JOIN fish_species s ON s.species_id = b.species_id`;

export async function listBatches(userId) {
  return query(`${BATCH_SELECT} WHERE p.user_id = ? ORDER BY b.stocking_date DESC, b.batch_id DESC`, [userId]);
}

export async function getBatch(userId, batchId) {
  const rows = await query(`${BATCH_SELECT} WHERE b.batch_id = ? AND p.user_id = ?`, [batchId, userId]);
  return rows[0] ?? null;
}

export async function createBatch(userId, v) {
  // The pond must belong to this user: the pondId in the body is never trusted
  const ponds = await query("SELECT status FROM ponds WHERE pond_id = ? AND user_id = ?", [v.pondId, userId]);
  if (!ponds.length) throw new FieldError({ pondId: "Choose one of your own ponds" });
  if (ponds[0].status !== "active") throw new FieldError({ pondId: "This pond is not active. Set it to active first." });
  const sp = await query("SELECT species_id FROM fish_species WHERE species_id = ?", [v.speciesId]);
  if (!sp.length) throw new FieldError({ speciesId: "Choose a species from the list" });

  const r = await query(
    `INSERT INTO stocking_batches (pond_id, species_id, stocking_date, initial_quantity, initial_avg_weight, purchase_cost, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [v.pondId, v.speciesId, v.stockingDate, v.initialQuantity, v.initialAvgWeight, v.purchaseCost]
  );
  return getBatch(userId, r.insertId);
}

export async function updateBatch(userId, batchId, v) {
  const current = await getBatch(userId, batchId);
  if (!current) return null;
  // status only moves forward: active -> harvesting -> completed
  if (BATCH_STATUSES.indexOf(v.status) < BATCH_STATUSES.indexOf(current.status)) {
    throw new FieldError({ status: "Status cannot go back to an earlier stage" });
  }
  await query(
    `UPDATE stocking_batches b JOIN ponds p ON p.pond_id = b.pond_id
     SET b.stocking_date = ?, b.initial_quantity = ?, b.initial_avg_weight = ?, b.purchase_cost = ?, b.status = ?
     WHERE b.batch_id = ? AND p.user_id = ?`,
    [v.stockingDate, v.initialQuantity, v.initialAvgWeight, v.purchaseCost, v.status, batchId, userId]
  );
  return getBatch(userId, batchId);
}

export async function deleteBatch(userId, batchId) {
  const r = await query(
    `DELETE b FROM stocking_batches b JOIN ponds p ON p.pond_id = b.pond_id
     WHERE b.batch_id = ? AND p.user_id = ?`,
    [batchId, userId]
  );
  return r.affectedRows > 0;
}

export const listSpecies = () => query("SELECT species_id AS speciesId, species_name AS speciesName FROM fish_species ORDER BY species_name");

export const listActivePonds = (userId) =>
  query("SELECT pond_id AS pondId, pond_name AS pondName FROM ponds WHERE user_id = ? AND status = 'active' ORDER BY pond_name", [userId]);

// Money for one batch: read from the view, each source summed on its own (no double counting)
export async function getBatchFinancials(batchId) {
  const rows = await query(
    `SELECT purchase_cost AS purchaseCost, feed_cost AS feedCost, other_expense AS otherExpense,
            total_cost AS totalCost, total_revenue AS totalRevenue, estimated_recorded_profit AS profit
     FROM v_batch_financial_summary WHERE batch_id = ?`,
    [batchId]
  );
  return rows[0] ?? null;
}

export async function getBatchCounts(batchId) {
  const rows = await query(
    `SELECT (SELECT COUNT(*) FROM feed_logs WHERE batch_id = ?) AS feedLogs,
            (SELECT COUNT(*) FROM harvests  WHERE batch_id = ?) AS harvests,
            (SELECT COUNT(*) FROM sales     WHERE batch_id = ?) AS sales,
            (SELECT COUNT(*) FROM expenses  WHERE batch_id = ?) AS expenses`,
    [batchId, batchId, batchId, batchId]
  );
  return rows[0];
}


export async function lockBatch(conn, userId, batchId) {
  // ONE locking read = ownership check (users -> ponds -> batch) + row lock.
  // It must be the first read of the transaction: the totals read afterwards then sees every committed sale.
  // (No "FOR UPDATE OF", so it also works on MariaDB / XAMPP.)
  const [rows] = await conn.execute(
    `SELECT b.batch_id AS batchId, b.stocking_date AS stockingDate
     FROM stocking_batches b
     WHERE b.batch_id = ? AND b.pond_id IN (SELECT p.pond_id FROM ponds p WHERE p.user_id = ?)
     FOR UPDATE`,
    [batchId, userId]
  );
  return rows[0] ?? null;
}

export async function stockTotals(conn, batchId) {
  const [rows] = await conn.execute(
    `SELECT (SELECT COALESCE(SUM(quantity_kg), 0) FROM harvests WHERE batch_id = ?) AS harvested,
            (SELECT COALESCE(SUM(quantity_kg), 0) FROM sales    WHERE batch_id = ?) AS sold`,
    [batchId, batchId]
  );
  return { harvested: Number(rows[0].harvested), sold: Number(rows[0].sold) };
}

export function listFinancials(userId) {
  return query(
    `SELECT batch_id AS batchId, pond_name AS pondName, species_name AS speciesName, purchase_cost AS purchaseCost,
            feed_cost AS feedCost, other_expense AS otherExpense, total_cost AS totalCost,
            total_revenue AS totalRevenue, estimated_recorded_profit AS profit
     FROM v_batch_financial_summary WHERE user_id = ? ORDER BY batch_id`,
    [userId]
  );
}