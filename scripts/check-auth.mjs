// Checks everything login/register needs, and tells you what is wrong.
//   node scripts/check-auth.mjs
import fs from "node:fs";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

nextEnv.loadEnvConfig(process.cwd()); // loads .env.local exactly the way Next.js does
const e = process.env;
let problems = 0;
const ok = (m) => console.log(`  OK    ${m}`);
const bad = (m, hint) => { problems++; console.log(`  FAIL  ${m}`); if (hint) console.log(`        -> ${hint}`); };

console.log("\n1) .env.local");
if (!fs.existsSync(".env.local")) bad(".env.local file not found in this folder", "Copy .env.example to .env.local");
else {
  ok(".env.local exists");
  const raw = fs.readFileSync(".env.local", "utf8");
  if (/^DB_PASSWORD=.*#/m.test(raw)) bad("DB_PASSWORD contains #", "In .env files # starts a comment, so the password is cut. Use a password without # (e.g. PukurApp_2026) and change it in MySQL too.");
}
for (const k of ["DB_HOST", "DB_USER", "DB_NAME"]) e[k] ? ok(`${k} = ${e[k]}`) : bad(`${k} is missing`, "Add it to .env.local (see .env.example)");
e.DB_PASSWORD === undefined ? bad("DB_PASSWORD is missing", "Add DB_PASSWORD=... (empty is allowed only if the MySQL user has no password)") : ok(`DB_PASSWORD has ${e.DB_PASSWORD.length} characters`);
(e.SESSION_SECRET || "").length >= 32 ? ok("SESSION_SECRET is set (32+ characters)") : bad("SESSION_SECRET is missing or shorter than 32 characters", "Login and register NEED this. Add a long random text, 32+ characters, to .env.local, then restart npm run dev.");

console.log("\n2) MySQL connection (as the app does it)");
let conn;
try {
  conn = await mysql.createConnection({ host: e.DB_HOST, port: Number(e.DB_PORT || 3306), user: e.DB_USER, password: e.DB_PASSWORD, database: e.DB_NAME });
  ok(`connected to ${e.DB_NAME} as ${e.DB_USER}`);
} catch (err) {
  const code = err.code || err.errors?.[0]?.code || "";
  const hints = {
    ER_ACCESS_DENIED_ERROR: "Wrong DB_USER/DB_PASSWORD. If pukur_app already existed, run in phpMyAdmin: ALTER USER 'pukur_app'@'localhost' IDENTIFIED BY 'PukurApp_2026'; and use that password.",
    ECONNREFUSED: "MySQL is not running. Start MySQL in XAMPP. Also try DB_HOST=127.0.0.1",
    ER_BAD_DB_ERROR: "Database does not exist. Load database/schema.sql first.",
  };
  bad(`cannot connect: ${code} ${err.message || ""}`.trim(), hints[code] || "Check XAMPP MySQL is running and DB_HOST / DB_USER / DB_PASSWORD");
}

if (conn) {
  console.log("\n3) Tables");
  const need = ["users", "ponds", "fish_species", "stocking_batches", "feed_logs", "water_readings", "harvests", "sales", "expenses"];
  const [t] = await conn.query("SHOW TABLES");
  const have = t.map((r) => Object.values(r)[0]);
  const missing = need.filter((x) => !have.includes(x));
  missing.length ? bad(`missing tables: ${missing.join(", ")}`, "Run schema.sql, seed.sql, views.sql, indexes.sql in this order") : ok("all 9 tables exist");
  const old = ["farmers", "app_users", "disease_cases", "other_expenses"].filter((x) => have.includes(x));
  if (old.length) bad(`old tables still present: ${old.join(", ")}`, "You are on the OLD database. Re-run schema.sql (it now drops and recreates the database).");

  console.log("\n4) Users and password check");
  try {
    const [cols] = await conn.query("SHOW COLUMNS FROM users");
    const names = cols.map((c) => c.Field);
    names.includes("phone") && names.includes("email") ? ok("users table has email and phone") : bad(`users table columns: ${names.join(", ")}`, "Old users table. Re-run schema.sql then seed.sql");
    const [[{ n }]] = await conn.query("SELECT COUNT(*) AS n FROM users");
    ok(`${n} user(s) in the table`);
    const [demo] = await conn.query("SELECT password_hash FROM users WHERE email = 'demo@pukurpulse.test'");
    if (!demo.length) bad("demo user not found", "Run seed.sql");
    else (await bcrypt.compare("Demo@1234", demo[0].password_hash)) ? ok("demo@pukurpulse.test + Demo@1234 matches the stored hash") : bad("demo password does not match the stored hash", "Re-run seed.sql");
  } catch (err) {
    bad(`users query failed: ${err.code} ${err.sqlMessage || err.message}`, "Re-run schema.sql and seed.sql");
  }
  await conn.end();
}

console.log(problems ? `\n${problems} problem(s) found. Fix the FAIL lines above, restart npm run dev, then try again.\n` : "\nAll checks passed. If login still fails, run the curl test from the guide and send me the output.\n");
process.exit(problems ? 1 : 0);