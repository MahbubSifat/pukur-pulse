import { NextResponse } from "next/server";

// ---------- API responses ----------
export const ok = (data, status = 200) => NextResponse.json({ success: true, data }, { status });
export const fail = (message, status = 400, details) =>
  NextResponse.json({ success: false, error: { message, details } }, { status });

export function serverError(err, where = "api") {
  console.error(`[${where}]`, err); // real reason always goes to the server log (terminal)
  // While developing (npm run dev) also show the real reason on screen. In production it stays hidden.
  if (process.env.NODE_ENV !== "production") {
    const reason = err?.code ? `${err.code}: ${err.sqlMessage || err.message}` : err?.message || String(err);
    return fail(`Server error (development only): ${reason}`, 500);
  }
  return fail("Something went wrong. Please try again.", 500);
}

// A service throws this to say "this field is wrong"
export class FieldError extends Error {
  constructor(details, message = "Please fix the highlighted fields") {
    super(message);
    this.details = details;
  }
}

// Same-origin check on top of SameSite cookies (blocks cross-site POST)
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

// Read JSON body safely
export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Turn known MySQL errors into friendly messages
const DUPLICATES = {
  uq_users_email: { email: "This email is already registered" },
  uq_users_phone: { phone: "This phone number is already registered" },
  uq_ponds_user_name: { pondName: "You already have a pond with this name" },
};
export function handleError(err, where) {
  if (err instanceof FieldError) return fail(err.message, 422, err.details);
  if (err?.code === "ER_DUP_ENTRY") {
    const key = Object.keys(DUPLICATES).find((k) => String(err.sqlMessage).includes(k));
    if (key) return fail("Please fix the highlighted fields", 409, DUPLICATES[key]);
  }
  if (err?.code === "ER_ROW_IS_REFERENCED" || err?.code === "ER_ROW_IS_REFERENCED_2") {
    return fail("This record has related data (batches, feed, sales...), so it cannot be deleted.", 409);
  }
  return serverError(err, where);
}

// URL id -> positive integer or null
export function parseId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ---------- Dates ----------
export const todayInApp = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
export function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// ---------- Formatting ----------
const money = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
export const formatMoney = (n) => {
  const v = Number(n);
  return v < 0 ? `-৳ ${money.format(Math.abs(v))}` : `৳ ${money.format(v)}`;
};
export const formatNumber = (n) => new Intl.NumberFormat("en-IN").format(Number(n));
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export function formatDate(s) {
  if (!s) return "—";
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  return dateFmt.format(new Date(Date.UTC(y, m - 1, d)));
}
