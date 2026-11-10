"use client";
import { useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { BarChart3 } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const GREEN = "#10B981", AQUA = "#06B6D4", AMBER = "#F59E0B", MUTED = "#64748B", LINE = "#E2E8F0";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLabel = (ym) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(2, 4)}`;
const taka = (v) => `৳ ${Number(v).toLocaleString("en-IN")}`;

const baseOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { color: MUTED } }, y: { beginAtZero: true, grid: { color: LINE }, ticks: { color: MUTED } } },
};

function Card({ title, sub, className = "", children }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 shadow-sm ${className}`}>
      <h2 className="font-semibold text-ink">{title}</h2>
      {sub && <p className="mb-3 text-xs text-muted">{sub}</p>}
      {children}
    </section>
  );
}
const Empty = ({ text }) => (
  <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl bg-canvas text-sm text-muted"><BarChart3 className="h-6 w-6" aria-hidden="true" />{text}</div>
);

function MonthlyBar({ rows, color, label, empty, height }) {
  if (!rows.length) return <Empty text={empty} />;
  const data = { labels: rows.map((r) => monthLabel(r.month)), datasets: [{ label, data: rows.map((r) => r.total), backgroundColor: color, borderRadius: 6, maxBarThickness: 44 }] };
  const options = { ...baseOptions, plugins: { ...baseOptions.plugins, tooltip: { callbacks: { label: (c) => ` ${taka(c.parsed.y)}` } } },
    scales: { ...baseOptions.scales, y: { ...baseOptions.scales.y, ticks: { color: MUTED, callback: (v) => taka(v) } } } };
  return <div className={height}><Bar data={data} options={options} /></div>;
}

const METRICS = {
  ph: { label: "pH", color: GREEN, unit: "" },
  dissolvedOxygen: { label: "DO (mg/L)", color: AQUA, unit: " mg/L" },
  temperature: { label: "Temperature (°C)", color: AMBER, unit: " °C" },
};

function WaterTrend({ water }) {
  const ponds = useMemo(() => [...new Map(water.map((w) => [w.pondId, w.pondName])).entries()], [water]);
  const [pondId, setPondId] = useState(ponds[0]?.[0] ?? null);
  const [metric, setMetric] = useState("ph");
  if (!water.length) return <Empty text="No water readings yet. Add one in Feed & Water." />;

  const rows = water.filter((w) => w.pondId === pondId);
  const m = METRICS[metric];
  const data = {
    labels: rows.map((r) => `${r.recordedAt.slice(5, 10)}`),
    // a missing measurement stays NULL: the line gets a gap, never a fake 0
    datasets: [{ label: m.label, data: rows.map((r) => r[metric]), borderColor: m.color, backgroundColor: m.color, tension: 0.3, pointRadius: 4, spanGaps: false }],
  };
  const options = { ...baseOptions, scales: { ...baseOptions.scales, y: { ...baseOptions.scales.y, beginAtZero: false } },
    plugins: { ...baseOptions.plugins, tooltip: { callbacks: { label: (c) => ` ${c.parsed.y}${m.unit}` } } } };
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select aria-label="Pond" value={pondId} onChange={(e) => setPondId(Number(e.target.value))} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
          {ponds.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        {Object.entries(METRICS).map(([key, v]) => (
          <button key={key} onClick={() => setMetric(key)} aria-pressed={metric === key}
            className={`rounded-full px-3 py-1 text-sm font-medium ${metric === key ? "bg-brand-900 text-white" : "bg-canvas text-muted hover:text-ink"}`}>{v.label}</button>
        ))}
      </div>
      <div className="h-64"><Line data={data} options={options} /></div>
    </>
  );
}

export default function DashboardCharts({ feedMonthly, salesMonthly, water }) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      <Card title="Monthly sales revenue" sub="Quantity sold × price per kg" className="lg:col-span-2">
        <MonthlyBar rows={salesMonthly} color={GREEN} label="Sales revenue" empty="No sales recorded yet." height="h-72" />
      </Card>
      <Card title="Monthly feed expenses" sub="Cost of feed bought">
        <MonthlyBar rows={feedMonthly} color={AQUA} label="Feed expense" empty="No feed records yet." height="h-72" />
      </Card>
      <Card title="Water quality trend" sub="Latest readings of one pond. Gaps mean the value was not measured." className="lg:col-span-3">
        <WaterTrend water={water} />
      </Card>
    </div>
  );
}