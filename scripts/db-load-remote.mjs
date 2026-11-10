// Loads the database into a CLOUD MySQL (the same files you used for XAMPP).
//   1) put the cloud values in a file named .env.remote (never commit it)
//   2) node scripts/db-load-remote.mjs --yes            (add --no-seed to skip the demo data)
// It DROPS and recreates the 9 tables + 2 views inside the database named in .env.remote.
import fs from "node:fs";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--")) || ".env.remote";
if (!fs.existsSync(file)) { console.error(`File ${file} not found. Create it first (see the guide).`); process.exit(1); }

// tiny .env reader: KEY=VALUE per line, # only starts a comment at the start of a line
const env = {};
for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const i = t.indexOf("=");
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}
for (const k of ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]) if (env[k] === undefined || env[k] === "") { console.error(`${k} is missing in ${file}`); process.exit(1); }

console.log(`Target: database "${env.DB_NAME}" on ${env.DB_HOST}:${env.DB_PORT || 3306} as ${env.DB_USER}`);
if (!args.includes("--yes")) { console.log("This DROPS and recreates the Pukur Pulse tables there. Run again with --yes to continue."); process.exit(0); }

const ssl = env.DB_CA_FILE ? { ca: fs.readFileSync(env.DB_CA_FILE) } : env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined;

// same SQL files as XAMPP, minus the parts a cloud database does not allow or need
function prep(name) {
  let sql = fs.readFileSync(`database/${name}`, "utf8");
  const cut = sql.indexOf("-- ---------- Application DB user");
  if (cut !== -1) sql = sql.slice(0, cut); // creating the DB user is done in the cloud console instead
  return sql.replace(/^\s*DROP DATABASE[^;]*;/gim, "").replace(/^\s*CREATE DATABASE[^;]*;/gim, "").replace(/^\s*USE\s+\w+;/gim, "");
}

const conn = await mysql.createConnection({
  host: env.DB_HOST, port: Number(env.DB_PORT || 3306), user: env.DB_USER, password: env.DB_PASSWORD,
  database: env.DB_NAME, ssl, multipleStatements: true,
});
try {
  await conn.query(`SET FOREIGN_KEY_CHECKS = 0;
    DROP VIEW IF EXISTS v_pond_feed_expense_summary, v_batch_financial_summary;
    DROP TABLE IF EXISTS sales, harvests, expenses, feed_logs, water_readings, stocking_batches, fish_species, ponds, users;
    SET FOREIGN_KEY_CHECKS = 1;`);
  await conn.query(prep("schema.sql")); console.log("  schema.sql  OK");
  if (!args.includes("--no-seed")) {
    let seed = prep("seed.sql");
    if (env.DEMO_PASSWORD) { // give the demo account your own password instead of the public one
      const hash = await bcrypt.hash(env.DEMO_PASSWORD, 10);
      seed = seed.replace(/'\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}'/, `'${hash}'`);
      console.log("  demo account password set from DEMO_PASSWORD");
    }
    await conn.query(seed); console.log("  seed.sql    OK");
  }
  await conn.query(prep("views.sql")); console.log("  views.sql   OK");
  await conn.query(prep("indexes.sql")); console.log("  indexes.sql OK");
  const [t] = await conn.query("SHOW TABLES");
  console.log(`\nDone. ${t.length} objects in ${env.DB_NAME} (9 tables + 2 views = 11).`);
} catch (e) {
  console.error("\nFAILED:", e.code || "", e.sqlMessage || e.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}