// Runs all 47 lab examples on a DISPOSABLE database (pukur_lab, a copy of pukur_pulse)
// and records the real results. Needs a MySQL admin account (CREATE DATABASE, CREATE USER, GRANT).
//   Windows Git Bash:  LAB_ADMIN_PASSWORD="your_root_password" npm run lab:verify
// Output: src/data/lab-results.json and docs/SYLLABUS_COVERAGE.md
import mysql from "mysql2/promise";
import fs from "node:fs";
import { TOPICS } from "../src/data/lab-topics.mjs";

const cfg = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.LAB_ADMIN_USER || "root",
  password: process.env.LAB_ADMIN_PASSWORD ?? "",
  ...(process.env.LAB_SOCKET ? { socketPath: process.env.LAB_SOCKET } : {}),
  multipleStatements: true,
  dateStrings: true,
};
const LAB = "pukur_lab";
const connect = (database) => mysql.createConnection({ ...cfg, database });

// Copy of the project database: schema + seed + views (NO indexes.sql, so topic 45 can create the index)
function labSql(file) {
  let sql = fs.readFileSync(`database/${file}`, "utf8");
  const cut = sql.indexOf("-- ---------- Application DB user");
  if (cut !== -1) sql = sql.slice(0, cut); // never create the app user in the lab
  return sql.replaceAll("pukur_pulse", LAB);
}

const preview = (v) => (v && typeof v === "object" ? JSON.parse(JSON.stringify(v)) : v);

async function runStatement(conn, sql) {
  try {
    const [res] = await conn.query(sql);
    if (Array.isArray(res)) return { sql, kind: "rows", rowCount: res.length, rows: res.slice(0, 5).map(preview) };
    return { sql, kind: "ok", affectedRows: res.affectedRows ?? 0 };
  } catch (e) {
    return { sql, kind: "error", errno: e.errno, code: e.code, message: e.sqlMessage || e.message };
  }
}

async function main() {
  const admin = await connect(undefined);
  const [[{ v }]] = await admin.query("SELECT VERSION() AS v");
  await admin.query(`DROP DATABASE IF EXISTS ${LAB}; CREATE DATABASE ${LAB} CHARACTER SET utf8mb4`);
  for (const f of ["schema.sql", "seed.sql", "views.sql"]) await admin.query(labSql(f));
  await admin.query("DROP USER IF EXISTS 'pukur_demo'@'localhost'");

  const main = await connect(LAB);
  const conns = {};
  const getConn = async (key) => (key ? (conns[key] ??= await connect(LAB)) : main);

  // topic 47 is run before topic 46 (the index must still exist), and we record the plan before the index too
  const order = [...TOPICS].sort((a, b) => (a.n === 46 ? 47.5 : a.n) - (b.n === 46 ? 47.5 : b.n));
  const explainSql = TOPICS.find((t) => t.n === 47).sql[0];
  const summarise = (r) => (r.kind === "rows" ? r.rows.map((x) => `type=${x.type}, key=${x.key ?? "NULL"}, rows=${x.rows}`).join("; ") : "n/a");
  let beforeIndex = "";

  const results = {};
  for (const t of order) {
    if (t.n === 45) beforeIndex = summarise(await runStatement(main, explainSql));
    const conn = await getConn(t.conn);
    for (const s of t.setup ?? []) await runStatement(admin, s);
    const statements = [];
    for (const s of t.sql) statements.push(await runStatement(conn, s));
    for (const s of t.cleanup ?? []) await runStatement(admin, s);

    let pass;
    let note = "";
    if (t.expectError) {
      pass = statements.every((s) => s.kind === "error");
      note = statements.map((s) => (s.kind === "error" ? `rejected: ERROR ${s.errno}` : "NOT rejected")).join("; ");
    } else {
      pass = statements.every((s) => s.kind !== "error");
      const last = statements.at(-1);
      if (pass && t.minRows && !(last.kind === "rows" && last.rowCount >= t.minRows)) pass = false;
      if (pass && t.expectLast) {
        const row = [...statements].reverse().find((s) => s.kind === "rows")?.rows?.[0];
        pass = String(row?.[t.expectLast.column]) === String(t.expectLast.equals);
      }
      note = last.kind === "rows" ? `${last.rowCount} row(s) returned` : last.kind === "ok" ? `OK, ${last.affectedRows} row(s) affected` : `ERROR ${last.errno}: ${last.message}`;
      if (!pass && statements.some((s) => s.kind === "error")) note = statements.find((s) => s.kind === "error").message;
    }
    if (t.n === 47) note += ` | after CREATE INDEX: ${summarise(statements[0])} | before: ${beforeIndex}`;
    results[t.n] = { status: pass ? "verified" : "failed", note, statements };
  }

  for (const c of Object.values(conns)) await c.end();
  await main.end();
  await admin.query("DROP USER IF EXISTS 'pukur_demo'@'localhost'");
  await admin.end();

  fs.mkdirSync("src/data", { recursive: true });
  fs.writeFileSync("src/data/lab-results.json", JSON.stringify({ generatedAt: new Date().toISOString(), mysqlVersion: v, results }, null, 2));

  // docs/SYLLABUS_COVERAGE.md is generated from the real results
  const rows = TOPICS.map((t) => {
    const r = results[t.n];
    return `| ${t.n} | ${t.title} | src/data/lab-topics.mjs (topic ${t.n}) | MySQL Lab → ${t.cat} | ${r.status === "verified" ? "✅ Verified" : "❌ Failed"} | ${r.note.replaceAll("|", "/").slice(0, 150)} |`;
  });
  const ok = Object.values(results).filter((r) => r.status === "verified").length;
  fs.writeFileSync("docs/SYLLABUS_COVERAGE.md",
    `# Syllabus Coverage (generated by \`npm run lab:verify\`)\n\nMySQL ${v} · ${new Date().toISOString()} · **${ok} / ${TOPICS.length} verified**\n\nEvery example runs on the disposable database \`${LAB}\` (a copy of pukur_pulse). A topic is marked verified only when its SQL really ran and gave the expected result (or the expected error).\n\n| # | Topic | SQL example location | Demonstration | Status | Test evidence |\n|---|---|---|---|---|---|\n${rows.join("\n")}\n`);

  console.log(`\n${ok} / ${TOPICS.length} topics verified (MySQL ${v})`);
  for (const t of TOPICS) if (results[t.n].status !== "verified") console.log(`  FAILED #${t.n} ${t.title}: ${results[t.n].note}`);
  process.exit(ok === TOPICS.length ? 0 : 1);
}
main().catch((e) => { console.error("Lab verify crashed:", e.message); process.exit(2); });