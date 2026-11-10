import { query } from "@/lib/db";
import { FieldError } from "@/lib/utils";
import { getPond } from "@/services/pond.service";

const WATER_SELECT = `
  SELECT w.reading_id AS readingId, w.pond_id AS pondId, p.pond_name AS pondName, w.recorded_at AS recordedAt,
         w.ph, w.dissolved_oxygen AS dissolvedOxygen, w.temperature, w.notes
  FROM water_readings w JOIN ponds p ON p.pond_id = w.pond_id`;

export const listWater = (userId) =>
  query(`${WATER_SELECT} WHERE p.user_id = ? ORDER BY w.recorded_at DESC, w.reading_id DESC LIMIT 200`, [userId]);

export async function getWater(userId, readingId) {
  const rows = await query(`${WATER_SELECT} WHERE w.reading_id = ? AND p.user_id = ?`, [readingId, userId]);
  return rows[0] ?? null;
}

export async function createWater(userId, v) {
  if (!(await getPond(userId, v.pondId))) throw new FieldError({ pondId: "Choose one of your own ponds" });
  const r = await query(
    "INSERT INTO water_readings (pond_id, recorded_at, ph, dissolved_oxygen, temperature, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [v.pondId, v.recordedAt, v.ph, v.dissolvedOxygen, v.temperature, v.notes]
  );
  return getWater(userId, r.insertId);
}

export async function updateWater(userId, readingId, v) {
  if (!(await getWater(userId, readingId))) return null;
  if (!(await getPond(userId, v.pondId))) throw new FieldError({ pondId: "Choose one of your own ponds" });
  await query(
    `UPDATE water_readings w JOIN ponds p ON p.pond_id = w.pond_id
     SET w.pond_id = ?, w.recorded_at = ?, w.ph = ?, w.dissolved_oxygen = ?, w.temperature = ?, w.notes = ?
     WHERE w.reading_id = ? AND p.user_id = ?`,
    [v.pondId, v.recordedAt, v.ph, v.dissolvedOxygen, v.temperature, v.notes, readingId, userId]
  );
  return getWater(userId, readingId);
}

export async function deleteWater(userId, readingId) {
  const r = await query(
    `DELETE w FROM water_readings w JOIN ponds p ON p.pond_id = w.pond_id WHERE w.reading_id = ? AND p.user_id = ?`,
    [readingId, userId]
  );
  return r.affectedRows > 0;
}
