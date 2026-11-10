import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { parseId, formatDate, formatMoney, formatNumber } from "@/lib/utils";
import { getBatch, getBatchFinancials, getBatchCounts } from "@/services/batch.service";
import { StatusBadge } from "@/components/ui/Badge";

export const metadata = { title: "Batch details" };

export default async function BatchDetailPage({ params }) {
  const user = await requireUser();
  const id = parseId((await params).id);
  const batch = id ? await getBatch(user.userId, id) : null; // ownership checked in SQL
  if (!batch) notFound();
  const [fin, counts] = await Promise.all([getBatchFinancials(id), getBatchCounts(id)]);
  const loss = fin.profit < 0;

  const rows = [
    ["Initial purchase cost", fin.purchaseCost],
    ["Feed cost", fin.feedCost],
    ["Other expenses", fin.otherExpense],
  ];

  return (
    <>
      <Link href="/batches" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden="true" />All batches</Link>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{batch.speciesName} · {batch.pondName}</h1>
        <StatusBadge status={batch.status} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[["Stocked on", formatDate(batch.stockingDate)], ["Fish stocked", formatNumber(batch.initialQuantity)],
          ["Average weight", batch.initialAvgWeight ? `${batch.initialAvgWeight} g` : "—"], ["Pond", batch.pondName]].map(([k, val]) => (
          <div key={k} className="rounded-2xl border border-line bg-surface p-4"><p className="text-xs text-muted">{k}</p><p className="mt-1 font-semibold">{val}</p></div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-semibold">Financial summary</h2>
          <dl className="space-y-2 text-sm">
            {rows.map(([k, val]) => (<div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt><dd>{formatMoney(val)}</dd></div>))}
            <div className="flex justify-between border-t border-line pt-2 font-medium"><dt>Total recorded cost</dt><dd>{formatMoney(fin.totalCost)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Total revenue</dt><dd>{formatMoney(fin.totalRevenue)}</dd></div>
            <div className={`flex justify-between rounded-lg px-3 py-2 font-semibold ${loss ? "bg-danger-bg text-danger-text" : "bg-brand-100 text-brand-900"}`}>
              <dt>Estimated Recorded {loss ? "Loss" : "Profit"}</dt><dd>{formatMoney(fin.profit)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">Based only on the records entered. It is not exact real-world net profit.</p>
        </section>
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-semibold">Records in this batch</h2>
          <ul className="space-y-2 text-sm">
            {[["Feed records", counts.feedLogs], ["Harvests", counts.harvests], ["Sales", counts.sales], ["Other expenses", counts.expenses]].map(([k, n]) => (
              <li key={k} className="flex justify-between"><span className="text-muted">{k}</span><span className="font-medium">{n}</span></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
