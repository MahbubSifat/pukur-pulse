import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { parseId, formatDate, formatMoney, formatNumber } from "@/lib/utils";
import { getPond, pondBatches, pondRecentReadings, pondFeedTotal } from "@/services/pond.service";
import { StatusBadge } from "@/components/ui/Badge";

export const metadata = { title: "Pond details" };

const cell = (v) => (v === null || v === undefined ? <span className="text-muted">—</span> : v); // NULL is shown as "—", never 0

export default async function PondDetailPage({ params }) {
  const user = await requireUser();
  const id = parseId((await params).id);
  const pond = id ? await getPond(user.userId, id) : null; // not yours = not found
  if (!pond) notFound();
  const [batches, readings, feed] = await Promise.all([pondBatches(id), pondRecentReadings(id), pondFeedTotal(id)]);

  return (
    <>
      <Link href="/ponds" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden="true" />All ponds</Link>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{pond.pondName}</h1>
        <StatusBadge status={pond.status} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[["Area", `${pond.areaDecimal} decimal`], ["Water type", pond.waterType ?? "—"], ["Location", pond.location ?? "—"], ["Total feed expenses", `${formatMoney(feed.feedCost)} (${formatNumber(feed.feedKg)} kg)`]].map(([k, val]) => (
          <div key={k} className="rounded-2xl border border-line bg-surface p-4"><p className="text-xs text-muted">{k}</p><p className="mt-1 font-semibold">{val}</p></div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-semibold">Stocking batches</h2>
          {batches.length === 0 ? <p className="text-sm text-muted">No batches in this pond yet.</p> : (
            <ul className="divide-y divide-line text-sm">
              {batches.map((b) => (
                <li key={b.batchId} className="flex items-center justify-between py-2.5">
                  <Link href={`/batches/${b.batchId}`} className="font-medium text-aqua-700 hover:underline">{b.speciesName}</Link>
                  <span className="text-muted">{formatNumber(b.initialQuantity)} fish · {formatDate(b.stockingDate)}</span>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-semibold">Recent water readings</h2>
          {readings.length === 0 ? <p className="text-sm text-muted">No water readings recorded.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted"><tr><th className="py-1.5 pr-3">Date</th><th className="pr-3">pH</th><th className="pr-3">DO</th><th>Temp °C</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {readings.map((r) => (
                    <tr key={r.readingId}><td className="py-2 pr-3">{formatDate(r.recordedAt)}</td><td className="pr-3">{cell(r.ph)}</td><td className="pr-3">{cell(r.dissolvedOxygen)}</td><td>{cell(r.temperature)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
