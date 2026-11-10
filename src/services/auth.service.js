import { query } from "@/lib/db";

// Password hash is returned ONLY by findUserByEmail (login). Never sent to the browser.
export async function findUserByEmail(email) {
  const rows = await query(
    "SELECT user_id AS userId, full_name AS fullName, email, phone, password_hash AS passwordHash FROM users WHERE email = ?",
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(userId) {
  const rows = await query(
    "SELECT user_id AS userId, full_name AS fullName, email, phone FROM users WHERE user_id = ?",
    [userId]
  );
  return rows[0] ?? null;
}

export async function createUser({ fullName, email, phone, passwordHash }) {
  const r = await query(
    "INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
    [fullName, email, phone, passwordHash]
  );
  return r.insertId;
}
