import { query } from "@/lib/db";
import { FieldError } from "@/lib/utils";
import { getBatch } from "@/services/batch.service";

const SELECT = `
  SELECT e.expense_id AS id, e.batch_id AS batchId, e.expense_date AS expenseDate, e.expense_type AS expenseType,
         e.description, e.amount, s.species_name AS speciesName, p.pond_name AS pondName
  FROM expenses e
  JOIN stocking_batches b ON b.batch_id = e.batch_id
  JOIN ponds p            ON p.pond_id = b.pond_id
  JOIN fish_species s     ON s.species_id = b.species_id`;

export const list = (userId) => query(`${SELECT} WHERE p.user_id = ? ORDER BY e.expense_date DESC, e.expense_id DESC LIMIT 200`, [userId]);
export async function get(userId, id) {
  return (await query(`${SELECT} WHERE e.expense_id = ? AND p.user_id = ?`, [id, userId]))[0] ?? null;
}

async function checkBatch(userId, v) {
  if (!(await getBatch(userId, v.batchId))) throw new FieldError({ batchId: "Choose one of your own batches" });
}

export async function create(userId, v) {
  await checkBatch(userId, v);
  const r = await query("INSERT INTO expenses (batch_id, expense_date, expense_type, description, amount) VALUES (?, ?, ?, ?, ?)",
    [v.batchId, v.expenseDate, v.expenseType, v.description, v.amount]);
  return get(userId, r.insertId);
}

export async function update(userId, id, v) {
  if (!(await get(userId, id))) return null;
  await checkBatch(userId, v);
  await query("UPDATE expenses SET batch_id = ?, expense_date = ?, expense_type = ?, description = ?, amount = ? WHERE expense_id = ?",
    [v.batchId, v.expenseDate, v.expenseType, v.description, v.amount, id]);
  return get(userId, id);
}

export async function remove(userId, id) {
  const r = await query(
    `DELETE e FROM expenses e JOIN stocking_batches b ON b.batch_id = e.batch_id JOIN ponds p ON p.pond_id = b.pond_id
     WHERE e.expense_id = ? AND p.user_id = ?`,
    [id, userId]
  );
  return r.affectedRows > 0;
}