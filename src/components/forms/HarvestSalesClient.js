"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Scale, HandCoins, Receipt, Calculator, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Badge from "@/components/ui/Badge";
import { validateHarvest, validateSale, validateExpense, EXPENSE_TYPES } from "@/lib/validations";
import { send } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/utils";

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const dash = (v) => (v === null || v === undefined || v === "" ? <span className="text-muted">—</span> : v);
const th = "px-5 py-3 font-semibold";

export default function HarvestSalesClient({ harvest, sales, expenses, summary, batches }) {
  const router = useRouter();
  const [tab, setTab] = useState("harvest");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState(null); // { id?, values }
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const batchOptions = batches.map((b) => ({ value: b.batchId, label: `${b.speciesName} · ${b.pondName} (${formatDate(b.stockingDate)})` }));
  const batchCell = (r) => <>{r.speciesName} <span className="text-muted">· {r.pondName}</span></>;

  // One config per tab: table columns, form fields, validation
  const TABS = {
    harvest: {
      label: "Harvest", icon: Scale, api: "/api/harvest", rows: harvest, validate: validateHarvest, add: "Add harvest",
      empty: "Record each (partial) harvest. A batch can have many harvests.",
      blank: { batchId: "", harvestDate: today(), quantityKg: "", averageWeight: "", notes: "" },
      cols: [["Date", (r) => formatDate(r.harvestDate)], ["Batch", batchCell], ["Quantity (kg)", (r) => r.quantityKg], ["Avg weight (g)", (r) => dash(r.averageWeight)], ["Notes", (r) => dash(r.notes)]],
      fields: [["batchId", "Stocking batch", "select", batchOptions, true], ["harvestDate", "Harvest date", "date"], ["quantityKg", "Quantity (kg)", "text"], ["averageWeight", "Average weight (g, optional)", "text"], ["notes", "Notes (optional)", "text"]],
    },
    sales: {
      label: "Sales", icon: HandCoins, api: "/api/sales", rows: sales, validate: validateSale, add: "Add sale",
      empty: "Record sales after a harvest. Sold quantity can never be more than harvested quantity.",
      blank: { batchId: "", buyerName: "", saleDate: today(), quantityKg: "", pricePerKg: "", paymentStatus: "unpaid" },
      cols: [["Date", (r) => formatDate(r.saleDate)], ["Batch", batchCell], ["Buyer", (r) => r.buyerName], ["Qty (kg)", (r) => r.quantityKg], ["Price/kg", (r) => formatMoney(r.pricePerKg)], ["Amount", (r) => formatMoney(r.amount)],
        ["Payment", (r) => <Badge tone={r.paymentStatus === "paid" ? "success" : "warning"}>{r.paymentStatus === "paid" ? "Paid" : "Unpaid"}</Badge>]],
      fields: [["batchId", "Stocking batch", "select", batchOptions, true], ["buyerName", "Buyer name", "text"], ["saleDate", "Sale date", "date"], ["quantityKg", "Quantity sold (kg)", "text"], ["pricePerKg", "Price per kg (৳)", "text"],
        ["paymentStatus", "Payment status", "select", [{ value: "paid", label: "Paid" }, { value: "unpaid", label: "Unpaid" }]]],
    },
    expenses: {
      label: "Expenses", icon: Receipt, api: "/api/expenses", rows: expenses, validate: validateExpense, add: "Add expense",
      empty: "Record other costs (labor, electricity...). Feed and purchase cost are counted automatically.",
      blank: { batchId: "", expenseDate: today(), expenseType: "", amount: "", description: "" },
      cols: [["Date", (r) => formatDate(r.expenseDate)], ["Batch", batchCell], ["Category", (r) => r.expenseType], ["Description", (r) => dash(r.description)], ["Amount", (r) => formatMoney(r.amount)]],
      fields: [["batchId", "Stocking batch", "select", batchOptions, false], ["expenseDate", "Expense date", "date"], ["expenseType", "Category", "select", EXPENSE_TYPES.map((t) => ({ value: t, label: t }))], ["amount", "Amount (৳)", "text"], ["description", "Description (optional)", "text"]],
    },
  };
  const isSummary = tab === "summary";
  const T = TABS[tab];
  const rows = isSummary ? [] : T.rows.filter((r) => !filter || String(r.batchId) === filter);

  const openAdd = () => { setForm({ values: T.blank }); setErrors({}); setFormError(""); };
  const openEdit = (r) => {
    const values = {};
    Object.keys(T.blank).forEach((k) => { values[k] = r[k] ?? ""; });
    setForm({ id: r.id, values }); setErrors({}); setFormError("");
  };
  const onChange = (e) => {
    setForm((f) => ({ ...f, values: { ...f.values, [e.target.name]: e.target.value } }));
    setErrors((x) => ({ ...x, [e.target.name]: undefined }));
  };

  async function save(e) {
    e.preventDefault();
    setFormError("");
    const check = T.validate(form.values);
    if (Object.keys(check.errors).length) return setErrors(check.errors);
    setSaving(true);
    const res = form.id ? await send("PATCH", `${T.api}/${form.id}`, form.values) : await send("POST", T.api, form.values);
    setSaving(false);
    if (!res.ok) return res.details && Object.keys(res.details).length ? setErrors(res.details) : setFormError(res.error);
    setForm(null);
    router.refresh();
  }

  async function remove() {
    setDeleting(true); setDeleteError("");
    const res = await send("DELETE", `${T.api}/${confirm.id}`);
    setDeleting(false);
    if (!res.ok) return setDeleteError(res.error);
    setConfirm(null);
    router.refresh();
  }

  const tot = summary.reduce((a, s) => ({ cost: a.cost + s.totalCost, rev: a.rev + s.totalRevenue, profit: a.profit + s.profit }), { cost: 0, rev: 0, profit: 0 });
  const tabBtn = (key, label, Icon) => (
    <button key={key} role="tab" aria-selected={tab === key} onClick={() => { setTab(key); setFilter(""); }}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === key ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />{label}
    </button>
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Harvest, Sales &amp; Expenses</h1>
          <p className="text-sm text-muted">What you caught, what you sold, and what it cost</p>
        </div>
        {!isSummary && <Button onClick={openAdd} disabled={batches.length === 0}><Plus className="h-4 w-4" aria-hidden="true" />{T.add}</Button>}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="inline-flex flex-wrap rounded-xl bg-line/60 p-1">
          {Object.entries(TABS).map(([key, t]) => tabBtn(key, t.label, t.icon))}
          {tabBtn("summary", "Financial summary", Calculator)}
        </div>
        {!isSummary && (
          <select aria-label="Filter by batch" value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            <option value="">All batches</option>
            {batches.map((b) => <option key={b.batchId} value={b.batchId}>{b.speciesName} · {b.pondName}</option>)}
          </select>
        )}
      </div>

      {isSummary ? (
        summary.length === 0 ? <EmptyState icon={Calculator} title="Nothing to summarise yet" text="Create a stocking batch first." /> : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
                  <tr><th className={th}>Batch</th><th className={th}>Purchase</th><th className={th}>Feed</th><th className={th}>Other</th><th className={th}>Total cost</th><th className={th}>Revenue</th><th className={th}>Est. profit / loss</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {summary.map((s) => (
                    <tr key={s.batchId}>
                      <td className="px-5 py-3.5 font-medium">{s.speciesName} <span className="font-normal text-muted">· {s.pondName}</span></td>
                      <td className="px-5 py-3.5">{formatMoney(s.purchaseCost)}</td><td className="px-5 py-3.5">{formatMoney(s.feedCost)}</td><td className="px-5 py-3.5">{formatMoney(s.otherExpense)}</td>
                      <td className="px-5 py-3.5">{formatMoney(s.totalCost)}</td><td className="px-5 py-3.5">{formatMoney(s.totalRevenue)}</td>
                      <td className={`px-5 py-3.5 font-semibold ${s.profit < 0 ? "text-danger-text" : "text-brand-900"}`}>{formatMoney(s.profit)}</td>
                    </tr>
                  ))}
                  <tr className="bg-canvas font-semibold">
                    <td className="px-5 py-3.5" colSpan={4}>All batches</td><td className="px-5 py-3.5">{formatMoney(tot.cost)}</td><td className="px-5 py-3.5">{formatMoney(tot.rev)}</td>
                    <td className={`px-5 py-3.5 ${tot.profit < 0 ? "text-danger-text" : "text-brand-900"}`}>{formatMoney(tot.profit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">Estimated Recorded Profit/Loss = total revenue − (purchase cost + feed + other expenses). It uses only the records entered and is not exact real-world net profit.</p>
          </>
        )
      ) : rows.length === 0 ? (
        <EmptyState icon={T.icon} title={`No ${T.label.toLowerCase()} records`} text={batches.length ? T.empty : "Create a stocking batch first."} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>{T.cols.map(([h]) => <th key={h} className={th}>{h}</th>)}<th className={`${th} text-right`}>Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-canvas/60">
                  {T.cols.map(([h, fn]) => <td key={h} className="px-5 py-3.5">{fn(r)}</td>)}
                  <td className="px-5 py-3.5"><div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(r)} aria-label="Edit" className="rounded-md p-2 text-muted hover:bg-brand-50 hover:text-brand-900"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                    <button onClick={() => { setConfirm({ id: r.id, label: `this ${T.label.toLowerCase()} record` }); setDeleteError(""); }} aria-label="Delete" className="rounded-md p-2 text-muted hover:bg-danger-bg hover:text-danger-text"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && !isSummary && (
        <Modal title={`${form.id ? "Edit" : "Add"} ${T.label.toLowerCase()} record`} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate className="space-y-4">
            {formError && <div role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3.5 py-3 text-sm text-danger-text"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{formError}</div>}
            {T.fields.map(([name, label, type, options, lockOnEdit]) =>
              type === "select" ? (
                <SelectField key={name} id={name} name={name} label={label} placeholder="Choose…" options={options} value={form.values[name]} onChange={onChange} error={errors[name]} disabled={Boolean(form.id && lockOnEdit)} />
              ) : (
                <TextField key={name} id={name} name={name} type={type} label={label} inputMode={type === "text" && /quantity|price|amount|Weight/.test(name) ? "decimal" : undefined} value={form.values[name]} onChange={onChange} error={errors[name]} />
              )
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