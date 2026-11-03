import mysql from "mysql2/promise";

// Dev server hot-reload হলে নতুন pool তৈরি হয়ে connection leak করে।
// তাই pool-টা globalThis-এ রেখে reuse করা হয়।
const globalForDb = globalThis;

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true, // DECIMAL কে string এর বদলে number হিসেবে দেবে
    dateStrings: true, // DATE/DATETIME কে timezone-safe string হিসেবে দেবে
  });
}

export const pool = globalForDb.__pukurPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.__pukurPool = pool;

// সাধারণ query: সবসময় parameterized (?) ব্যবহার করবে
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Multi-step কাজের জন্য transaction helper (Sales phase-এ ব্যবহার হবে)
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