import mysql from "mysql2/promise";

// Dev hot-reload would create a new pool each time. Keep one pool on globalThis.
const g = globalThis;

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true, // DECIMAL -> number
    dateStrings: true,    // DATE/DATETIME -> plain string (no timezone surprises)
  });
}

export const pool = g.__ppPool ?? (g.__ppPool = createPool());

// Always parameterized (?) queries -> no SQL injection
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Multi-step work: all steps succeed (COMMIT) or none do (ROLLBACK)
export async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
