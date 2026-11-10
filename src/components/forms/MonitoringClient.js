"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Wheat, Droplets, AlertCircle, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Badge from "@/components/ui/Badge";
import { validateFeed, validateWater, waterWarnings, FEED_TYPES, WATER_THRESHOLDS } from "@/lib/validations";
import { send } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/utils";

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const today = () => nowLocal().slice(0, 10);
const dash = (v) => (v === null || v === undefined ? <span className="text-muted">—</span> : v); // NULL stays blank, never 0

export default function MonitoringClient({ feed, water, batches, ponds }) {
  const router = useRouter();
  const [tab, setTab] = useState("feed");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState(null); // { kind, id?, values }
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null); // { kind, id, label }
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isFeed = tab === "feed";
  const base = { feed: "/api/feed", water: "/api/water" };

  const openAdd = () => {
    setForm(isFeed
      ? { kind: "feed", values: { batchId: "", feedDate: today(), feedType: "", quantityKg: "", cost: "" } }
      : { kind: "water", values: { pondId: "", recordedAt: nowLocal(), ph: "", dissolvedOxygen: "", temperature: "", notes: "" } });
    setErrors({}); setFormError("");
  };
  const openEditFeed = (f) => { setForm({ kind: "feed", id: f.feedId, values: { batchId: f.batchId, feedDate: f.feedDate, feedType: f.feedType, quantityKg: f.quantityKg, cost: f.cost } }); setErrors({}); setFormError(""); };
  const openEditWater = (w) => {
    setForm({ kind: "water", id: w.readingId, values: { pondId: w.pondId, recordedAt: w.recordedAt.slice(0, 16).replace(" ", "T"), ph: w.ph ?? "", dissolvedOxygen: w.dissolvedOxygen ?? "", temperature: w.temperature ?? "", notes: w.notes ?? "" } });
    setErrors({}); setFormError("");
  };
  const onChange = (e) => {
    setForm((f) => ({ ...f, values: { ...f.values, [e.target.name]: e.target.value } }));
    setErrors((x) => ({ ...x, [e.target.name]: undefined }));
  };

  async function save(e) {
    e.preventDefault();
    setFormError("");
    const check = form.kind === "feed" ? validateFeed(form.values) : validateWater(form.values);
    if (Object.keys(check.errors).length) return setErrors(check.errors);
    setSaving(true);
    const url = base[form.kind];
    const res = form.id ? await send("PATCH", `${url}/${form.id}`, form.values) : await send("POST", url, form.values);
    setSaving(false);
    if (!res.ok) return res.details ? setErrors(res.details) : setFormError(res.error);
    setForm(null);
    router.refresh();
  }

  async function remove() {
    setDeleting(true); setDeleteError("");
    const res = await send("DELETE", `${base[confirm.kind]}/${confirm.id}`);
    setDeleting(false);
    if (!res.ok) return setDeleteError(res.error);
    setConfirm(null);
    router.refresh();
  }

  const feedRows = feed.filter((f) => !filter || String(f.batchId) === filter);
  const waterRows = water.filter((w) => !filter || String(w.pondId) === filter);
  const v = form?.values;
  const rowBtn = "rounded-md p-2 text-muted hover:bg-brand-50 hover:text-brand-900";
  const th = "px-5 py-3 font-semibold";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Feed &amp; Water</h1>
          <p className="text-sm text-muted">Daily feed records and water quality readings</p>
        </div>
        <Button onClick={openAdd} disabled={isFeed ? batches.length === 0 : ponds.length === 0}>
          <Plus className="h-4 w-4" aria-hidden="true" />{isFeed ? "Add feed record" : "Add reading"}
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="inline-flex rounded-xl bg-line/60 p-1">
          {[["feed", "Feed records", Wheat], ["water", "Water quality", Droplets]].map(([key, label, Icon]) => (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => { setTab(key); setFilter(""); }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === key ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />{label}
            </button>
          ))}
        </div>
        <select aria-label={isFeed ? "Filter by batch" : "Filter by pond"} value={filter} onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
          <option value="">{isFeed ? "All batches" : "All ponds"}</option>
          {isFeed ? batches.map((b) => <option key={b.batchId} value={b.batchId}>{b.speciesName} · {b.pondName}</option>)
                  : ponds.map((p) => <option key={p.pondId} value={p.pondId}>{p.pondName}</option>)}
        </select>
      </div>

      {isFeed ? (
        feedRows.length === 0 ? (
          <EmptyState icon={Wheat} title="No feed records" text={batches.length ? "Record each feeding to track feed cost per batch." : "Create a stocking batch first, then record feed for it."} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
                <tr><th className={th}>Date</th><th className={th}>Batch</th><th className={th}>Feed type</th><th className={th}>Qty (kg)</th><th className={th}>Cost</th><th className={`${th} text-right`}>Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {feedRows.map((f) => (
                  <tr key={f.feedId} className="hover:bg-canvas/60">
                    <td className="px-5 py-3.5">{formatDate(f.feedDate)}</td>
                    <td className="px-5 py-3.5 font-medium text-ink">{f.speciesName} <span className="font-normal text-muted">· {f.pondName}</span></td>
                    <td className="px-5 py-3.5">{f.feedType}</td>
                    <td className="px-5 py-3.5">{f.quantityKg}</td>
                    <td className="px-5 py-3.5">{formatMoney(f.cost)}</td>
                    <td className="px-5 py-3.5"><div className="flex justify-end gap-1">
                      <button onClick={() => openEditFeed(f)} aria-label="Edit feed record" className={rowBtn}><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                      <button onClick={() => { setConfirm({ kind: "feed", id: f.feedId, label: `${f.feedType} feed on ${formatDate(f.feedDate)}` }); setDeleteError(""); }} aria-label="Delete feed record" className={`${rowBtn} hover:!bg-danger-bg hover:!text-danger-text`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        waterRows.length === 0 ? (
          <EmptyState icon={Droplets} title="No water readings" text={ponds.length ? "Record pH, dissolved oxygen or temperature. You can leave a field empty if it was not measured." : "Add a pond first, then record its water quality."} />
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
                  <tr><th className={th}>Recorded</th><th className={th}>Pond</th><th className={th}>pH</th><th className={th}>DO (mg/L)</th><th className={th}>Temp (°C)</th><th className={th}>Check</th><th className={`${th} text-right`}>Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {waterRows.map((w) => {
                    const warn = waterWarnings(w);
                    return (
                      <tr key={w.readingId} className="hover:bg-canvas/60">
                        <td className="px-5 py-3.5 whitespace-nowrap">{formatDate(w.recordedAt)} <span className="text-muted">{w.recordedAt.slice(11, 16)}</span></td>
                        <td className="px-5 py-3.5 font-medium text-ink">{w.pondName}</td>
                        <td className="px-5 py-3.5">{dash(w.ph)}</td>
                        <td className="px-5 py-3.5">{dash(w.dissolvedOxygen)}</td>
                        <td className="px-5 py-3.5">{dash(w.temperature)}</td>
                        <td className="px-5 py-3.5">{warn.length ? <span className="inline-flex items-center gap-1.5"><TriangleAlert className="h-4 w-4 text-warn" aria-hidden="true" /><Badge tone="warning">{warn.join(", ")} out of range</Badge></span> : <Badge tone="success">Normal</Badge>}</td>
                        <td className="px-5 py-3.5"><div className="flex justify-end gap-1">
                          <button onClick={() => openEditWater(w)} aria-label="Edit reading" className={rowBtn}><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                          <button onClick={() => { setConfirm({ kind: "water", id: w.readingId, label: `the reading of ${w.pondName} on ${formatDate(w.recordedAt)}` }); setDeleteError(""); }} aria-label="Delete reading" className={`${rowBtn} hover:!bg-danger-bg hover:!text-danger-text`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">
              Warning limits are sample values for academic demonstration (pH {WATER_THRESHOLDS.ph.min}–{WATER_THRESHOLDS.ph.max}, DO ≥ {WATER_THRESHOLDS.dissolvedOxygen.min} mg/L, temperature {WATER_THRESHOLDS.temperature.min}–{WATER_THRESHOLDS.temperature.max} °C). They are not universal fish-health recommendations.
            </p>
          </>
        )
      )}

      {form && (
        <Modal title={form.kind === "feed" ? (form.id ? "Edit feed record" : "Add feed record") : (form.id ? "Edit water reading" : "Add water reading")} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate className="space-y-4">
            {formError && <div role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger-text"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{formError}</div>}
            {form.kind === "feed" ? (
              <>
                <SelectField id="batchId" name="batchId" label="Stocking batch" placeholder="Choose batch" value={v.batchId} onChange={onChange} error={errors.batchId}
                  options={batches.map((b) => ({ value: b.batchId, label: `${b.speciesName} · ${b.pondName} (${formatDate(b.stockingDate)})` }))} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField id="feedDate" name="feedDate" type="date" label="Feed date" required value={v.feedDate} onChange={onChange} error={errors.feedDate} />
                  <SelectField id="feedType" name="feedType" label="Feed type" placeholder="Choose type" value={v.feedType} onChange={onChange} error={errors.feedType}
                    options={FEED_TYPES.map((t) => ({ value: t, label: t }))} />
                  <TextField id="quantityKg" name="quantityKg" label="Quantity (kg)" inputMode="decimal" required value={v.quantityKg} onChange={onChange} error={errors.quantityKg} />
                  <TextField id="cost" name="cost" label="Cost (৳)" inputMode="decimal" required value={v.cost} onChange={onChange} error={errors.cost} />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField id="pondId" name="pondId" label="Pond" placeholder="Choose pond" value={v.pondId} onChange={onChange} error={errors.pondId}
                    options={ponds.map((p) => ({ value: p.pondId, label: p.pondName }))} />
                  <TextField id="recordedAt" name="recordedAt" type="datetime-local" label="Date and time" required value={v.recordedAt} onChange={onChange} error={errors.recordedAt} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField id="ph" name="ph" label="pH" inputMode="decimal" placeholder="7.5" value={v.ph} onChange={onChange} error={errors.ph} />
                  <TextField id="dissolvedOxygen" name="dissolvedOxygen" label="DO (mg/L)" inputMode="decimal" placeholder="5.5" value={v.dissolvedOxygen} onChange={onChange} error={errors.dissolvedOxygen} />
                  <TextField id="temperature" name="temperature" label="Temp (°C)" inputMode="decimal" placeholder="28" value={v.temperature} onChange={onChange} error={errors.temperature} />
                </div>
                <p className="-mt-2 text-xs text-muted">Leave a field empty if it was not measured. At least one value is required.</p>
                <TextField id="notes" name="notes" label="Notes (optional)" value={v.notes} onChange={onChange} error={errors.notes} />
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" loading={saving}>{form.id ? "Save changes" : "Save"}</Button>
            </div>
          </form>
        </Modal>
      )}

      {confirm && (
        <Modal title="Delete record?" onClose={() => setConfirm(null)}>
          <p className="text-sm text-muted">Delete <strong className="text-ink">{confirm.label}</strong>? This cannot be undone.</p>
          {deleteError && <div role="alert" className="mt-4 rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger-text">{deleteError}</div>}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button onClick={remove} loading={deleting} className="!bg-danger hover:!bg-danger-text">Delete</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
