import { query } from "@/lib/db";

// Every query is scoped by user_id. Another user's pond simply "does not exist".
export async function listPonds(userId) {
  return query(
    `SELECT p.pond_id AS pondId, p.pond_name AS pondName, p.area_decimal AS areaDecimal,
            p.water_type AS waterType, p.location, p.status,
            COUNT(b.batch_id) AS batchCount
     FROM ponds p
     LEFT JOIN stocking_batches b ON b.pond_id = p.pond_id
     WHERE p.user_id = ?
     GROUP BY p.pond_id, p.pond_name, p.area_decimal, p.water_type, p.location, p.status
     ORDER BY p.pond_name`,
    [userId]
  );
}

export async function getPond(userId, pondId) {
  const rows = await query(
    `SELECT pond_id AS pondId, pond_name AS pondName, area_decimal AS areaDecimal,
            water_type AS waterType, location, status, created_at AS createdAt
     FROM ponds WHERE pond_id = ? AND user_id = ?`,
    [pondId, userId]
  );
  return rows[0] ?? null;
}

export async function createPond(userId, v) {
  const r = await query(
    "INSERT INTO ponds (user_id, pond_name, area_decimal, water_type, location, status) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, v.pondName, v.areaDecimal, v.waterType, v.location, v.status]
  );
  return getPond(userId, r.insertId);
}

export async function updatePond(userId, pondId, v) {
  const r = await query(
    `UPDATE ponds SET pond_name = ?, area_decimal = ?, water_type = ?, location = ?, status = ?
     WHERE pond_id = ? AND user_id = ?`,
    [v.pondName, v.areaDecimal, v.waterType, v.location, v.status, pondId, userId]
  );
  return r.affectedRows ? getPond(userId, pondId) : null;
}

// FK RESTRICT stops the delete if batches or water readings exist (safe deletion)
export async function deletePond(userId, pondId) {
  const r = await query("DELETE FROM ponds WHERE pond_id = ? AND user_id = ?", [pondId, userId]);
  return r.affectedRows > 0;
}

// Detail page parts (call getPond first, so ownership is already proven)
export async function pondBatches(pondId) {
  return query(
    `SELECT b.batch_id AS batchId, s.species_name AS speciesName, b.stocking_date AS stockingDate,
            b.initial_quantity AS initialQuantity, b.status
     FROM stocking_batches b JOIN fish_species s ON s.species_id = b.species_id
     WHERE b.pond_id = ? ORDER BY b.stocking_date DESC`,
    [pondId]
  );
}

export async function pondRecentReadings(pondId) {
  return query(
    `SELECT reading_id AS readingId, recorded_at AS recordedAt, ph,
            dissolved_oxygen AS dissolvedOxygen, temperature, notes
     FROM water_readings WHERE pond_id = ? ORDER BY recorded_at DESC LIMIT 5`,
    [pondId]
  );
}

export async function pondFeedTotal(pondId) {
  const rows = await query(
    `SELECT COALESCE(SUM(fl.cost), 0) AS feedCost, COALESCE(SUM(fl.quantity_kg), 0) AS feedKg
     FROM feed_logs fl JOIN stocking_batches b ON b.batch_id = fl.batch_id WHERE b.pond_id = ?`,
    [pondId]
  );
  return rows[0];
}
