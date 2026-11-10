"use client";
import { useState } from "react";
import { Search, CheckCircle2, XCircle, CircleDashed } from "lucide-react";
import Badge from "@/components/ui/Badge";

const cell = (v) => (v === null ? "NULL" : typeof v === "object" ? JSON.stringify(v) : String(v));

function Evidence({ result }) {
  if (!result) return <p className="text-sm text-muted">Not verified yet. Run <code className="rounded bg-canvas px-1.5 py-0.5">npm run lab:verify</code>.</p>;
  const lastRows = [...result.statements].reverse().find((s) => s.kind === "rows" && s.rows.length);
  const cols = lastRows ? Object.keys(lastRows.rows[0]) : [];
  return (
    <div className="space-y-3">
      <ul className="space-y-1 text-sm">
        {result.statements.map((s, i) => (
          <li key={i} className="flex gap-2">
            {s.kind === "error" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />}
            <span className="text-muted">
              {s.kind === "rows" && `${s.rowCount} row(s) returned`}
              {s.kind === "ok" && `OK, ${s.affectedRows} row(s) affected`}
              {s.kind === "error" && <>Rejected by MySQL: <span className="font-mono text-xs text-ink">ERROR {s.errno} ({s.code})</span> {s.message}</>}
            </span>
          </li>
        ))}
      </ul>
      {lastRows && (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas text-muted"><tr>{cols.map((c) => <th key={c} className="px-3 py-2 font-semibold">{c}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {lastRows.rows.map((r, i) => <tr key={i}>{cols.map((c) => <td key={c} className="px-3 py-1.5 font-mono">{cell(r[c])}</td>)}</tr>)}
            </tbody>
          </table>
          {lastRows.rowCount > 5 && <p className="bg-canvas px-3 py-1.5 text-xs text-muted">First 5 of {lastRows.rowCount} rows</p>}
        </div>
      )}
    </div>
  );
}

export default function LabClient({ topics, categories, meta }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(null);

  const list = topics.filter((t) => (cat === "All" || t.cat === cat) &&
    `${t.n} ${t.title} ${t.table} ${t.sql.join(" ")} ${t.bn}`.toLowerCase().includes(q.trim().toLowerCase()));
  const verified = topics.filter((t) => t.result?.status === "verified").length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">MySQL Lab</h1>
          <p className="max-w-2xl text-sm text-muted">All 47 syllabus topics with real SQL. Every example was run on a separate lab database (a copy of this project), never on your live farm data. No SQL can be typed or run from this page.</p>
        </div>
        <div className="rounded-xl bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-900">{verified} / {topics.length} verified</div>
      </div>
      {meta && <p className="mb-4 text-xs text-muted">Verified on MySQL {meta.mysqlVersion} · {meta.generatedAt.slice(0, 16).replace("T", " ")} UTC</p>}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topic, table or SQL…" aria-label="Search topics"
            className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-sm" />
        </label>
      </div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Categories">
        {["All", ...categories].map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${cat === c ? "bg-brand-900 text-white" : "bg-surface text-muted ring-1 ring-line hover:text-ink"}`}>{c}</button>
        ))}
      </div>

      {list.length === 0 ? <p className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">No topic matches your search.</p> : (
        <ul className="space-y-3">
          {list.map((t) => {
            const isOpen = open === t.n;
            const st = t.result?.status;
            return (
              <li key={t.n} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
                <button onClick={() => setOpen(isOpen ? null : t.n)} aria-expanded={isOpen} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-canvas/60">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-sm font-semibold text-brand-900">{t.n}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{t.title}</span>
                    <span className="block truncate text-xs text-muted">{t.cat} · {t.table}</span>
                  </span>
                  {st === "verified" ? <Badge tone="success">Verified</Badge> : st === "failed" ? <Badge tone="danger">Failed</Badge> : <Badge tone="neutral"><CircleDashed className="mr-1 inline h-3 w-3" aria-hidden="true" />Not run</Badge>}
                </button>
                {isOpen && (
                  <div className="space-y-4 border-t border-line px-5 py-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">বাংলায়</p><p className="text-sm leading-relaxed">{t.bn}</p></div>
                      <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Technical explanation</p><p className="text-sm leading-relaxed">{t.en}</p></div>
                    </div>
                    <div className="text-sm"><span className="font-semibold">Purpose: </span><span className="text-muted">{t.purpose}</span></div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">SQL (related table: {t.table})</p>
                      <pre className="overflow-x-auto rounded-lg bg-ink p-4 text-xs leading-relaxed text-brand-100">{t.sql.join(";\n\n")};</pre>
                    </div>
                    <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Verified result (real MySQL output)</p><Evidence result={t.result} /></div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}