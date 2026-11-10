import { query, withTransaction } from "@/lib/db";
import { FieldError, todayInApp } from "@/lib/utils";
import { lockBatch, stockTotals } from "@/services/batch.service";

// sale amount is never stored: it is calculated here
const SELECT = `
  SELECT sl.sale_id AS id, sl.batch_id AS batchId, sl.buyer_name AS buyerName, sl.sale_date AS saleDate,
         sl.quantity_kg AS quantityKg, sl.price_per_kg AS pricePerKg, ROUND(sl.quantity_kg * sl.price_per_kg, 2) AS amount,
         sl.payment_status AS paymentStatus, s.species_name AS speciesName, p.pond_name AS pondName
  FROM sales sl
  JOIN stocking_batches b ON b.batch_id = sl.batch_id
  JOIN ponds p            ON p.pond_id = b.pond_id
  JOIN fish_species s     ON s.species_id = b.species_id`;

export const list = (userId) => query(`${SELECT} WHERE p.user_id = ? ORDER BY sl.sale_date DESC, sl.sale_id DESC LIMIT 200`, [userId]);
export async function get(userId, id) {
  return (await query(`${SELECT} WHERE sl.sale_id = ? AND p.user_id = ?`, [id, userId]))[0] ?? null;
}

// Runs inside the transaction, after the batch row is locked
async function checkRules(conn, batch, v, ignoreSaleId) {
  if (v.saleDate < batch.stockingDate) throw new FieldError({ saleDate: "Sale date cannot be before the stocking date" });
  if (v.saleDate > todayInApp()) throw new FieldError({ saleDate: "Sale date cannot be in the future" });
  const { harvested, sold } = await stockTotals(conn, batch.batchId);
  let soldOther = sold;
  if (ignoreSaleId) {
    const [r] = await conn.execute("SELECT quantity_kg FROM sales WHERE sale_id = ?", [ignoreSaleId]);
    soldOther = sold - Number(r[0]?.quantity_kg ?? 0);
  }
  const available = Math.round((harvested - soldOther) * 100) / 100;
  if (v.quantityKg > available) {
    throw new FieldError({ quantityKg: `Only ${available} kg available (harvested ${harvested} kg, already sold ${soldOther} kg)` });
  }
}

// START TRANSACTION -> lock batch -> check -> INSERT -> COMMIT (any error = ROLLBACK)
export async function create(userId, v) {
  const id = await withTransaction(async (conn) => {
    const batch = await lockBatch(conn, userId, v.batchId);
    if (!batch) throw new FieldError({ batchId: "Choose one of your own batches" });
    await checkRules(conn, batch, v, null);
    const [r] = await conn.execute(
      "INSERT INTO sales (batch_id, buyer_name, sale_date, quantity_kg, price_per_kg, payment_status) VALUES (?, ?, ?, ?, ?, ?)",
      [v.batchId, v.buyerName, v.saleDate, v.quantityKg, v.pricePerKg, v.paymentStatus]
    );
    return r.insertId;
  });
  return get(userId, id);
}

export async function update(userId, id, v) {
  const current = await get(userId, id);
  if (!current) return null;
  await withTransaction(async (conn) => {
    const batch = await lockBatch(conn, userId, current.batchId); // the batch of a sale does not change
    await checkRules(conn, batch, v, id);
    await conn.execute(
      "UPDATE sales SET buyer_name = ?, sale_date = ?, quantity_kg = ?, price_per_kg = ?, payment_status = ? WHERE sale_id = ?",
      [v.buyerName, v.saleDate, v.quantityKg, v.pricePerKg, v.paymentStatus, id]
    );
  });
  return get(userId, id);
}

export async function remove(userId, id) {
  const r = await query(
    `DELETE sl FROM sales sl JOIN stocking_batches b ON b.batch_id = sl.batch_id JOIN ponds p ON p.pond_id = b.pond_id
     WHERE sl.sale_id = ? AND p.user_id = ?`,
    [id, userId]
  );
  return r.affectedRows > 0;
}