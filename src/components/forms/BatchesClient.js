"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, Fish, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { StatusBadge } from "@/components/ui/Badge";
import { validateBatch, BATCH_STATUSES } from "@/lib/validations";
import { send } from "@/lib/api-client";
import { formatDate, formatMoney, formatNumber } from "@/lib/utils";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const EMPTY = { pondId: "", speciesId: "", stockingDate: "", initialQuantity: "", initialAvgWeight: "", purchaseCost: "", status: "active" };

export default function BatchesClient({ batches, ponds, species }) {
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => { setForm({ values: EMPTY }); setErrors({}); setFormError(""); };
  const openEdit = (b) => {
    setForm({
      id: b.batchId, label: `${b.speciesName} in ${b.pondName}`,
      values: { stockingDate: b.stockingDate, initialQuantity: String(b.initialQuantity), initialAvgWeight: b.initialAvgWeight ?? "", purchaseCost: String(b.purchaseCost), status: b.status },
    });
    setErrors({}); setFormError("");
  };
  const onChange = (e) => {
    setForm((f) => ({ ...f, values: { ...f.values, [e.target.name]: e.target.value } }));
    setErrors((x) => ({ ...x, [e.target.name]: undefined }));
  };

  async function save(e) {
    e.preventDefault();
    setFormError("");
    const check = validateBatch(form.values, { isEdit: Boolean(form.id) });
    if (Object.keys(check.errors).length) return setErrors(check.errors);
    setSaving(true);
    const res = form.id ? await send("PATCH", `/api/batches/${form.id}`, form.values) : await send("POST", "/api/batches", form.values);
    setSaving(false);
    if (!res.ok) return res.details ? setErrors(res.details) : setFormError(res.error);
    setForm(null);
    router.refresh();
  }

  async function remove() {
    setDeleting(true); setDeleteError("");
    const res = await send("DELETE", `/api/batches/${confirm.batchId}`);
    setDeleting(false);
    if (!res.ok) return setDeleteError(res.error);
    setConfirm(null);
    router.refresh();
  }

  const v = form?.values;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stocking batches</h1>
          <p className="text-sm text-muted">One batch = one species stocked in one pond</p>
        </div>
        <Button onClick={openAdd} disabled={ponds.length === 0}><Plus className="h-4 w-4" aria-hidden="true" />New batch</Button>
      </div>
      {ponds.length === 0 && <p className="mb-4 rounded-lg bg-warn-bg px-4 py-3 text-sm text-warn-text">You need at least one <strong>active</strong> pond before you can stock fish. <Link href="/ponds" className="underline">Go to Ponds</Link></p>}

      {batches.length === 0 ? (
        <EmptyState icon={Fish} title="No stocking batches yet" text="Create a batch when you release fish into a pond." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Species</th><th className="px-5 py-3 font-semibold">Pond</th>
                <th className="px-5 py-3 font-semibold">Stocked on</th><th className="px-5 py-3 font-semibold">Fish</th>
                <th className="px-5 py-3 font-semibold">Purchase cost</th><th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {batches.map((b) => (
                <tr key={b.batchId} className="hover:bg-canvas/60">
                  <td className="px-5 py-3.5 font-medium text-ink">{b.speciesName}</td>
                  <td className="px-5 py-3.5">{b.pondName}</td>
                  <td className="px-5 py-3.5">{formatDate(b.stockingDate)}</td>
                  <td className="px-5 py-3.5">{formatNumber(b.initialQuantity)}</td>
                  <td className="px-5 py-3.5">{formatMoney(b.purchaseCost)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <Link href={`/batches/${b.batchId}`} aria-label="View batch" className="rounded-md p-2 text-muted hover:bg-brand-50 hover:text-brand-900"><Eye className="h-4 w-4" aria-hidden="true" /></Link>
                      <button onClick={() => openEdit(b)} aria-label="Edit batch" className="rounded-md p-2 text-muted hover:bg-brand-50 hover:text-brand-900"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                      <button onClick={() => { setConfirm(b); setDeleteError(""); }} aria-label="Delete batch" className="rounded-md p-2 text-muted hover:bg-danger-bg hover:text-danger-text"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <Modal title={form.id ? "Edit batch" : "New stocking batch"} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate className="space-y-4">
            {formError && <div role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger-text"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{formError}</div>}
            {form.id ? (
              <p className="rounded-lg bg-canvas px-3.5 py-2.5 text-sm text-muted">{form.label} <span className="text-xs">(pond and species cannot be changed)</span></p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField id="pondId" name="pondId" label="Pond" placeholder="Choose pond" value={v.pondId} onChange={onChange} error={errors.pondId}
                  options={ponds.map((p) => ({ value: p.pondId, label: p.pondName }))} />
                <SelectField id="speciesId" name="speciesId" label="Fish species" placeholder="Choose species" value={v.speciesId} onChange={onChange} error={errors.speciesId}
                  options={species.map((s) => ({ value: s.speciesId, label: s.speciesName }))} />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField id="stockingDate" name="stockingDate" type="date" label="Stocking date" required value={v.stockingDate} onChange={onChange} error={errors.stockingDate} />
              <TextField id="initialQuantity" name="initialQuantity" label="Initial fish quantity" inputMode="numeric" required value={v.initialQuantity} onChange={onChange} error={errors.initialQuantity} />
              <TextField id="initialAvgWeight" name="initialAvgWeight" label="Average weight (g, optional)" inputMode="decimal" value={v.initialAvgWeight} onChange={onChange} error={errors.initialAvgWeight} />
              <TextField id="purchaseCost" name="purchaseCost" label="Purchase cost (৳)" inputMode="decimal" required value={v.purchaseCost} onChange={onChange} error={errors.purchaseCost} />
            </div>
            {form.id && (
              <SelectField id="status" name="status" label="Status" value={v.status} onChange={onChange} error={errors.status}
                hint="Status can only move forward: active → harvesting → completed"
                options={BATCH_STATUSES.map((s) => ({ value: s, label: cap(s) }))} />
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" loading={saving}>{form.id ? "Save changes" : "Create batch"}</Button>
            </div>
          </form>
        </Modal>
      )}

      {confirm && (
        <Modal title="Delete batch?" onClose={() => setConfirm(null)}>
          <p className="text-sm text-muted">Delete the <strong className="text-ink">{confirm.speciesName}</strong> batch in {confirm.pondName}? A batch that has feed, harvest, sales or expense records cannot be deleted.</p>
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
