import { query } from "@/lib/db";
import { FieldError, todayInApp } from "@/lib/utils";
import { getBatch } from "@/services/batch.service";

const FEED_SELECT = `
  SELECT f.feed_id AS feedId, f.batch_id AS batchId, f.feed_date AS feedDate, f.feed_type AS feedType,
         f.quantity_kg AS quantityKg, f.cost, s.species_name AS speciesName, p.pond_name AS pondName
  FROM feed_logs f
  JOIN stocking_batches b ON b.batch_id = f.batch_id
  JOIN ponds p            ON p.pond_id = b.pond_id
  JOIN fish_species s     ON s.species_id = b.species_id`;

export const listFeed = (userId) =>
  query(`${FEED_SELECT} WHERE p.user_id = ? ORDER BY f.feed_date DESC, f.feed_id DESC LIMIT 200`, [userId]);

export async function getFeed(userId, feedId) {
  const rows = await query(`${FEED_SELECT} WHERE f.feed_id = ? AND p.user_id = ?`, [feedId, userId]);
  return rows[0] ?? null;
}

// Parent ownership first: the batch must belong to this user
async function checkBatch(userId, v) {
  const batch = await getBatch(userId, v.batchId);
  if (!batch) throw new FieldError({ batchId: "Choose one of your own batches" });
  if (v.feedDate < batch.stockingDate) throw new FieldError({ feedDate: "Feed date cannot be before the stocking date" });
  if (v.feedDate > todayInApp()) throw new FieldError({ feedDate: "Feed date cannot be in the future" });
}

export async function createFeed(userId, v) {
  await checkBatch(userId, v);
  const r = await query(
    "INSERT INTO feed_logs (batch_id, feed_date, feed_type, quantity_kg, cost) VALUES (?, ?, ?, ?, ?)",
    [v.batchId, v.feedDate, v.feedType, v.quantityKg, v.cost]
  );
  return getFeed(userId, r.insertId);
}

export async function updateFeed(userId, feedId, v) {
  if (!(await getFeed(userId, feedId))) return null;
  await checkBatch(userId, v);
  await query(
    `UPDATE feed_logs f JOIN stocking_batches b ON b.batch_id = f.batch_id JOIN ponds p ON p.pond_id = b.pond_id
     SET f.batch_id = ?, f.feed_date = ?, f.feed_type = ?, f.quantity_kg = ?, f.cost = ?
     WHERE f.feed_id = ? AND p.user_id = ?`,
    [v.batchId, v.feedDate, v.feedType, v.quantityKg, v.cost, feedId, userId]
  );
  return getFeed(userId, feedId);
}

export async function deleteFeed(userId, feedId) {
  const r = await query(
    `DELETE f FROM feed_logs f JOIN stocking_batches b ON b.batch_id = f.batch_id JOIN ponds p ON p.pond_id = b.pond_id
     WHERE f.feed_id = ? AND p.user_id = ?`,
    [feedId, userId]
  );
  return r.affectedRows > 0;
}
