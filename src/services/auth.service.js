import "server-only";
import { query } from "@/lib/db/pool";

const USER_SELECT = `
  SELECT u.user_id AS userId, u.username, u.password_hash AS passwordHash,
         u.role, u.is_active AS isActive, u.farmer_id AS farmerId, f.full_name AS fullName
  FROM app_users u
  LEFT JOIN farmers f ON f.farmer_id = u.farmer_id`;

function toUser(row) {
  return row ? { ...row, isActive: Boolean(row.isActive) } : null;
}

export async function findUserByUsername(username) {
  const rows = await query(`${USER_SELECT} WHERE u.username = ?`, [username]);
  return toUser(rows[0]);
}

export async function findUserById(userId) {
  const rows = await query(`${USER_SELECT} WHERE u.user_id = ?`, [userId]);
  return toUser(rows[0]);
}