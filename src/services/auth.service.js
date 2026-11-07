import "server-only";
import { query, withTransaction } from "@/lib/db/pool";

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

// দুটো INSERT একসাথে: farmers আর app_users।
// দ্বিতীয়টা ব্যর্থ হলে প্রথমটাও বাতিল (ROLLBACK), তাই এতিম farmer থাকে না।
// Role সবসময় 'farmer': বাইরে থেকে কেউ role পাঠালেও এখানে পৌঁছায় না।
export async function registerFarmer({ fullName, phone, address, username, passwordHash }) {
  return withTransaction(async (conn) => {
    const [farmerResult] = await conn.execute(
      "INSERT INTO farmers (full_name, phone, address) VALUES (?, ?, ?)",
      [fullName, phone, address || null]
    );
    const farmerId = farmerResult.insertId;

    const [userResult] = await conn.execute(
      "INSERT INTO app_users (farmer_id, username, password_hash, role) VALUES (?, ?, ?, 'farmer')",
      [farmerId, username, passwordHash]
    );

    return { userId: userResult.insertId, farmerId, username, role: "farmer", fullName };
  });
}