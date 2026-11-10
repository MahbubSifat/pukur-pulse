"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, Waves, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { StatusBadge } from "@/components/ui/Badge";
import { validatePond, POND_STATUSES, WATER_TYPES } from "@/lib/validations";
import { send } from "@/lib/api-client";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const EMPTY = { pondName: "", areaDecimal: "", waterType: "freshwater", location: "", status: "active" };

export default function PondsClient({ ponds }) {
  const router = useRouter();
  const [form, setForm] = useState(null);       // null | { id?, values }
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null); // pond to delete
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => { setForm({ values: EMPTY }); setErrors({}); setFormError(""); };
  const openEdit = (p) => {
    setForm({ id: p.pondId, values: { pondName: p.pondName, areaDecimal: String(p.areaDecimal), waterType: p.waterType ?? "", location: p.location ?? "", status: p.status } });
    setErrors({}); setFormError("");
  };
  const onChange = (e) => {
    setForm((f) => ({ ...f, values: { ...f.values, [e.target.name]: e.target.value } }));
    setErrors((x) => ({ ...x, [e.target.name]: undefined }));
  };

  async function save(e) {
    e.preventDefault();
    setFormError("");
    const check = validatePond(form.values);
    if (Object.keys(check.errors).length) return setErrors(check.errors);
    setSaving(true);
    const res = form.id ? await send("PATCH", `/api/ponds/${form.id}`, form.values) : await send("POST", "/api/ponds", form.values);
    setSaving(false);
    if (!res.ok) return res.details ? setErrors(res.details) : setFormError(res.error);
    setForm(null);
    router.refresh();
  }

  async function remove() {
    setDeleting(true); setDeleteError("");
    const res = await send("DELETE", `/api/ponds/${confirm.pondId}`);
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
          <h1 className="text-2xl font-semibold tracking-tight">Ponds</h1>
          <p className="text-sm text-muted">{ponds.length} {ponds.length === 1 ? "pond" : "ponds"} on your farm</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" aria-hidden="true" />Add pond</Button>
      </div>

      {ponds.length === 0 ? (
        <EmptyState icon={Waves} title="No ponds yet" text="Add your first pond to start recording stocking, feed and sales.">
          <Button onClick={openAdd}><Plus className="h-4 w-4" aria-hidden="true" />Add pond</Button>
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Pond</th><th className="px-5 py-3 font-semibold">Area (decimal)</th>
                <th className="px-5 py-3 font-semibold">Water</th><th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Batches</th><th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ponds.map((p) => (
                <tr key={p.pondId} className="hover:bg-canvas/60">
                  <td className="px-5 py-3.5 font-medium text-ink">{p.pondName}</td>
                  <td className="px-5 py-3.5">{p.areaDecimal}</td>
                  <td className="px-5 py-3.5">{p.waterType ? cap(p.waterType) : "—"}</td>
                  <td className="px-5 py-3.5">{p.location ?? "—"}</td>
                  <td className="px-5 py-3.5">{p.batchCount}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <Link href={`/ponds/${p.pondId}`} aria-label={`View ${p.pondName}`} className="rounded-md p-2 text-muted hover:bg-brand-50 hover:text-brand-900"><Eye className="h-4 w-4" aria-hidden="true" /></Link>
                      <button onClick={() => openEdit(p)} aria-label={`Edit ${p.pondName}`} className="rounded-md p-2 text-muted hover:bg-brand-50 hover:text-brand-900"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                      <button onClick={() => { setConfirm(p); setDeleteError(""); }} aria-label={`Delete ${p.pondName}`} className="rounded-md p-2 text-muted hover:bg-danger-bg hover:text-danger-text"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <Modal title={form.id ? "Edit pond" : "Add pond"} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate className="space-y-4">
            {formError && <div role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger-text"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{formError}</div>}
            <TextField id="pondName" name="pondName" label="Pond name" required value={v.pondName} onChange={onChange} error={errors.pondName} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField id="areaDecimal" name="areaDecimal" label="Area (decimal)" inputMode="decimal" placeholder="25" required value={v.areaDecimal} onChange={onChange} error={errors.areaDecimal} />
              <SelectField id="waterType" name="waterType" label="Water type" placeholder="Not set" value={v.waterType} onChange={onChange} error={errors.waterType}
                options={WATER_TYPES.map((w) => ({ value: w, label: cap(w) }))} />
            </div>
            <TextField id="location" name="location" label="Location (optional)" value={v.location} onChange={onChange} error={errors.location} />
            <SelectField id="status" name="status" label="Status" value={v.status} onChange={onChange} error={errors.status}
              options={POND_STATUSES.map((s) => ({ value: s, label: cap(s) }))} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" loading={saving}>{form.id ? "Save changes" : "Add pond"}</Button>
            </div>
          </form>
        </Modal>
      )}

      {confirm && (
        <Modal title="Delete pond?" onClose={() => setConfirm(null)}>
          <p className="text-sm text-muted">Delete <strong className="text-ink">{confirm.pondName}</strong>? This cannot be undone. A pond that has batches or water readings cannot be deleted.</p>
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
