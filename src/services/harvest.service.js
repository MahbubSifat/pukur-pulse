import { query, withTransaction } from "@/lib/db";
import { FieldError, todayInApp } from "@/lib/utils";
import { lockBatch, stockTotals } from "@/services/batch.service";

const SELECT = `
  SELECT h.harvest_id AS id, h.batch_id AS batchId, h.harvest_date AS harvestDate, h.quantity_kg AS quantityKg,
         h.average_weight AS averageWeight, h.notes, s.species_name AS speciesName, p.pond_name AS pondName
  FROM harvests h
  JOIN stocking_batches b ON b.batch_id = h.batch_id
  JOIN ponds p            ON p.pond_id = b.pond_id
  JOIN fish_species s     ON s.species_id = b.species_id`;

export const list = (userId) => query(`${SELECT} WHERE p.user_id = ? ORDER BY h.harvest_date DESC, h.harvest_id DESC LIMIT 200`, [userId]);
export async function get(userId, id) {
  return (await query(`${SELECT} WHERE h.harvest_id = ? AND p.user_id = ?`, [id, userId]))[0] ?? null;
}

function checkDate(batch, v) {
  if (v.harvestDate < batch.stockingDate) throw new FieldError({ harvestDate: "Harvest date cannot be before the stocking date" });
  if (v.harvestDate > todayInApp()) throw new FieldError({ harvestDate: "Harvest date cannot be in the future" });
}

// Total harvested must never fall below total sold
async function checkNotBelowSold(conn, batchId, message) {
  const { harvested, sold } = await stockTotals(conn, batchId);
  if (harvested < sold) throw new FieldError({ quantityKg: message }, message);
}

export async function create(userId, v) {
  const id = await withTransaction(async (conn) => {
    const batch = await lockBatch(conn, userId, v.batchId);
    if (!batch) throw new FieldError({ batchId: "Choose one of your own batches" });
    checkDate(batch, v);
    const [r] = await conn.execute(
      "INSERT INTO harvests (batch_id, harvest_date, quantity_kg, average_weight, notes) VALUES (?, ?, ?, ?, ?)",
      [v.batchId, v.harvestDate, v.quantityKg, v.averageWeight, v.notes]
    );
    return r.insertId;
  });
  return get(userId, id);
}

export async function update(userId, id, v) {
  const current = await get(userId, id);
  if (!current) return null;
  await withTransaction(async (conn) => {
    const batch = await lockBatch(conn, userId, current.batchId); // the batch of a harvest does not change
    checkDate(batch, v);
    await conn.execute("UPDATE harvests SET harvest_date = ?, quantity_kg = ?, average_weight = ?, notes = ? WHERE harvest_id = ?",
      [v.harvestDate, v.quantityKg, v.averageWeight, v.notes, id]);
    await checkNotBelowSold(conn, current.batchId, "Harvest cannot be lower than the quantity already sold"); // throws -> ROLLBACK
  });
  return get(userId, id);
}

export async function remove(userId, id) {
  const current = await get(userId, id);
  if (!current) return false;
  await withTransaction(async (conn) => {
    await lockBatch(conn, userId, current.batchId);
    await conn.execute("DELETE FROM harvests WHERE harvest_id = ?", [id]);
    await checkNotBelowSold(conn, current.batchId, "Cannot delete: sales already use this harvested quantity");
  });
  return true;
}