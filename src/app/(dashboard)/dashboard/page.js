import Link from "next/link";
import { Waves, Fish, Wheat, Wallet, Scale, TrendingUp, Plus, Droplets, HandCoins } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboardStats, getChartData } from "@/services/dashboard.service";
import { listFeed } from "@/services/feed.service";
import { listWater } from "@/services/water.service";
import * as salesSvc from "@/services/sales.service";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { waterWarnings } from "@/lib/validations";
import { formatDate, formatMoney, formatNumber } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Dashboard" };

function Stat({ icon: Icon, label, value, sub, tone = "bg-brand-100 text-brand-900" }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [s, charts, feed, water, sales] = await Promise.all([
    getDashboardStats(user.userId), getChartData(user.userId), listFeed(user.userId), listWater(user.userId), salesSvc.list(user.userId),
  ]);
  const firstName = user.fullName.split(" ")[0];

  if (s.totalPonds === 0) {
    return (
      <>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Welcome, {firstName}</h1>
        <EmptyState icon={Waves} title="No ponds yet" text="Add your first pond to start tracking your farm.">
          <Link href="/ponds" className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add a pond
          </Link>
        </EmptyState>
      </>
    );
  }

  const loss = s.profit < 0;
  return (
    <>
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white sm:p-8">
        <p className="text-sm text-brand-100">Welcome back</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{firstName}, here is your farm today</h1>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/ponds" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-100"><Waves className="h-4 w-4" aria-hidden="true" />Ponds</Link>
          <Link href="/batches" className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"><Fish className="h-4 w-4" aria-hidden="true" />Stocking batches</Link>
          <Link href="/monitoring" className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"><Droplets className="h-4 w-4" aria-hidden="true" />Feed &amp; water</Link>
          <Link href="/harvest-sales" className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"><HandCoins className="h-4 w-4" aria-hidden="true" />Sales</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Waves} label="Total ponds" value={formatNumber(s.totalPonds)} />
        <Stat icon={Fish} label="Active stocking batches" value={formatNumber(s.activeBatches)} tone="bg-sky-soft text-aqua-700" />
        <Stat icon={Fish} label="Total fish stocked" value={formatNumber(s.totalFish)} tone="bg-sky-soft text-aqua-700" />
        <Stat icon={Wheat} label="Total feed" value={`${formatNumber(s.feedKg)} kg`} tone="bg-cream text-warn-text" />
        <Stat icon={Wallet} label="Total feed expenses" value={formatMoney(s.feedCost)} tone="bg-cream text-warn-text" />
        <Stat icon={Scale} label="Total harvest" value={`${formatNumber(s.harvestKg)} kg`} />
        <Stat icon={TrendingUp} label="Total sales revenue" value={formatMoney(s.revenue)} />
        <div className={`rounded-2xl border p-5 shadow-sm ${loss ? "border-danger/20 bg-danger-bg" : "border-brand-500/30 bg-brand-100"}`}>
          <p className="text-sm text-muted">Estimated Recorded {loss ? "Loss" : "Profit"}</p>
          <p className={`mt-1 text-2xl font-semibold tracking-tight ${loss ? "text-danger-text" : "text-brand-900"}`}>{formatMoney(s.profit)}</p>
          <p className="mt-1 text-xs text-muted">Revenue {formatMoney(s.revenue)} − recorded cost {formatMoney(s.totalCost)}. Not exact net profit.</p>
        </div>
      </div>

      <DashboardCharts feedMonthly={charts.feedMonthly} salesMonthly={charts.salesMonthly} water={charts.water} />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Recent title="Recent feed records" href="/monitoring" empty="No feed records yet.">
          {feed.slice(0, 5).map((f) => (
            <li key={f.feedId} className="flex justify-between gap-3 py-2.5 text-sm"><span>{f.feedType} · {f.pondName}</span><span className="shrink-0 text-muted">{f.quantityKg} kg · {formatDate(f.feedDate)}</span></li>
          ))}
        </Recent>
        <Recent title="Recent water readings" href="/monitoring" empty="No water readings yet.">
          {water.slice(0, 5).map((w) => {
            const warn = waterWarnings(w);
            return (
              <li key={w.readingId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span>{w.pondName} <span className="text-muted">· {formatDate(w.recordedAt)}</span></span>
                {warn.length ? <Badge tone="warning">{warn.join(", ")}</Badge> : <Badge tone="success">Normal</Badge>}
              </li>
            );
          })}
        </Recent>
        <Recent title="Recent sales" href="/harvest-sales" empty="No sales yet.">
          {sales.slice(0, 5).map((x) => (
            <li key={x.id} className="flex justify-between gap-3 py-2.5 text-sm"><span>{x.buyerName}</span><span className="shrink-0 text-muted">{formatMoney(x.amount)} · {formatDate(x.saleDate)}</span></li>
          ))}
        </Recent>
      </div>
    </>
  );
}

function Recent({ title, href, empty, children }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><Link href={href} className="text-xs font-semibold text-aqua-700 hover:underline">View all</Link></div>
      {items.length === 0 ? <p className="py-6 text-center text-sm text-muted">{empty}</p> : <ul className="divide-y divide-line">{children}</ul>}
    </section>
  );
}