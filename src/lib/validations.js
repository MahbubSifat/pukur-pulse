// Runs in the browser (fast messages) AND on the server (real security).
const text = (v) => (typeof v === "string" ? v.trim() : "");
const bytes = (s) => new TextEncoder().encode(s).length;

export const POND_STATUSES = ["active", "maintenance", "inactive"];
export const BATCH_STATUSES = ["active", "harvesting", "completed"];
export const WATER_TYPES = ["freshwater", "brackish"];

export function validateLogin(body) {
  const errors = {};
  const email = text(body?.email).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email) errors.email = "Enter your email";
  if (!password) errors.password = "Enter your password";
  return { values: { email, password }, errors };
}

export function validateRegistration(body) {
  const errors = {};
  const fullName = text(body?.fullName);
  const email = text(body?.email).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";
  // phone: remove spaces/dashes, turn +8801XXXXXXXXX into 01XXXXXXXXX
  const phone = text(body?.phone).replace(/[\s-]/g, "").replace(/^\+?88(01\d{9})$/, "$1");

  if (fullName.length < 2) errors.fullName = "Enter your full name";
  else if (fullName.length > 100) errors.fullName = "Name must be 100 characters or fewer";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 150) errors.email = "Enter a valid email address";

  if (!/^01[3-9]\d{8}$/.test(phone)) errors.phone = "Enter a valid mobile number, like 01712345678";

  if (password.length < 8) errors.password = "Use at least 8 characters";
  else if (bytes(password) > 72) errors.password = "Password is too long";
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = "Include at least one letter and one number";

  if (!errors.password && confirmPassword !== password) errors.confirmPassword = "Passwords do not match";

  return { values: { fullName, email, phone, password }, errors };
}

export function validatePond(body) {
  const errors = {};
  const pondName = text(body?.pondName);
  const location = text(body?.location);
  const waterType = text(body?.waterType);
  const status = text(body?.status) || "active";
  const area = text(String(body?.areaDecimal ?? ""));

  if (pondName.length < 2) errors.pondName = "Enter the pond name";
  else if (pondName.length > 100) errors.pondName = "Name must be 100 characters or fewer";
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(area) || Number(area) <= 0) errors.areaDecimal = "Enter the area in decimals, like 25 or 12.5";
  if (waterType && !WATER_TYPES.includes(waterType)) errors.waterType = "Choose a water type from the list";
  if (location.length > 255) errors.location = "Location must be 255 characters or fewer";
  if (!POND_STATUSES.includes(status)) errors.status = "Choose a valid status";

  return {
    values: { pondName, areaDecimal: Number(area), waterType: waterType || null, location: location || null, status },
    errors,
  };
}

const posInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export function validateBatch(body, { isEdit = false } = {}) {
  const errors = {};
  const stockingDate = text(String(body?.stockingDate ?? ""));
  const qty = text(String(body?.initialQuantity ?? ""));
  const weight = text(String(body?.initialAvgWeight ?? ""));
  const cost = text(String(body?.purchaseCost ?? ""));
  const status = isEdit ? text(body?.status) : "active";
  const pondId = posInt(body?.pondId);
  const speciesId = posInt(body?.speciesId);

  if (!isEdit) {
    if (!pondId) errors.pondId = "Choose a pond";
    if (!speciesId) errors.speciesId = "Choose a species";
  } else if (!BATCH_STATUSES.includes(status)) errors.status = "Choose a valid status";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(stockingDate) || Number.isNaN(Date.parse(stockingDate))) errors.stockingDate = "Choose the stocking date";
  if (!/^\d{1,8}$/.test(qty) || Number(qty) < 1) errors.initialQuantity = "Enter a whole number of fish, 1 or more";
  if (weight && (!/^\d{1,6}(\.\d{1,2})?$/.test(weight) || Number(weight) <= 0)) errors.initialAvgWeight = "Enter the average weight in grams, like 25";
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(cost)) errors.purchaseCost = "Enter the purchase cost, like 9000";

  return {
    values: { pondId, speciesId, stockingDate, initialQuantity: Number(qty), initialAvgWeight: weight ? Number(weight) : null, purchaseCost: Number(cost), status },
    errors,
  };
}

// ---------- Feed & Water ----------
export const FEED_TYPES = ["Starter", "Grower", "Finisher", "Other"];

// DEMONSTRATION thresholds only. Not universal fish-health recommendations.
export const WATER_THRESHOLDS = {
  ph: { min: 6.5, max: 9.0, label: "pH" },
  dissolvedOxygen: { min: 4.0, max: null, label: "DO" },
  temperature: { min: 20, max: 32, label: "Temperature" },
};
export function waterWarnings(r) {
  const out = [];
  for (const [key, t] of Object.entries(WATER_THRESHOLDS)) {
    const v = r[key];
    if (v === null || v === undefined) continue; // NULL = not measured, never a warning
    if ((t.min !== null && v < t.min) || (t.max !== null && v > t.max)) out.push(t.label);
  }
  return out;
}

export function validateFeed(body) {
  const errors = {};
  const batchId = posInt(body?.batchId);
  const feedDate = text(String(body?.feedDate ?? ""));
  const feedType = text(body?.feedType);
  const qty = text(String(body?.quantityKg ?? ""));
  const cost = text(String(body?.cost ?? ""));

  if (!batchId) errors.batchId = "Choose a stocking batch";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(feedDate) || Number.isNaN(Date.parse(feedDate))) errors.feedDate = "Choose the feed date";
  if (!FEED_TYPES.includes(feedType)) errors.feedType = "Choose a feed type";
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(qty) || Number(qty) <= 0) errors.quantityKg = "Enter the quantity in kg, more than 0";
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(cost)) errors.cost = "Enter the cost, 0 or more";
  return { values: { batchId, feedDate, feedType, quantityKg: Number(qty), cost: Number(cost) }, errors };
}

// A blank field becomes NULL. A missing value is never saved as 0.
const optNum = (raw, min, max, label, errors, key) => {
  const s = text(String(raw ?? ""));
  if (s === "") return null;
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(s) || Number(s) < min || Number(s) > max) {
    errors[key] = `${label} must be between ${min} and ${max}`;
    return null;
  }
  return Number(s);
};

export function validateWater(body) {
  const errors = {};
  const pondId = posInt(body?.pondId);
  const recordedAt = text(String(body?.recordedAt ?? "")).replace("T", " ");
  const notes = text(body?.notes);
  if (!pondId) errors.pondId = "Choose a pond";
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(recordedAt) || Number.isNaN(Date.parse(recordedAt.replace(" ", "T")))) errors.recordedAt = "Choose the date and time";
  const ph = optNum(body?.ph, 0, 14, "pH", errors, "ph");
  const dissolvedOxygen = optNum(body?.dissolvedOxygen, 0, 30, "DO", errors, "dissolvedOxygen");
  const temperature = optNum(body?.temperature, 0, 50, "Temperature", errors, "temperature");
  if (!Object.keys(errors).length && ph === null && dissolvedOxygen === null && temperature === null) {
    errors.ph = "Enter at least one measurement (pH, DO or temperature)";
  }
  if (notes.length > 1000) errors.notes = "Notes must be 1000 characters or fewer";
  return {
    values: { pondId, recordedAt: recordedAt.length === 16 ? `${recordedAt}:00` : recordedAt, ph, dissolvedOxygen, temperature, notes: notes || null },
    errors,
  };
}


// ---------- Harvest, Sales, Expenses ----------
export const EXPENSE_TYPES = ["Labor", "Electricity", "Maintenance", "Transportation", "Other"];
export const PAYMENT_STATUSES = ["paid", "unpaid"];

const dateOk = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const decOk = (s, intDigits) => new RegExp(`^\\d{1,${intDigits}}(\\.\\d{1,2})?$`).test(s);

export function validateHarvest(body) {
  const errors = {};
  const batchId = posInt(body?.batchId);
  const harvestDate = text(String(body?.harvestDate ?? ""));
  const qty = text(String(body?.quantityKg ?? ""));
  const wt = text(String(body?.averageWeight ?? ""));
  const notes = text(body?.notes);
  if (!batchId) errors.batchId = "Choose a stocking batch";
  if (!dateOk(harvestDate)) errors.harvestDate = "Choose the harvest date";
  if (!decOk(qty, 8) || Number(qty) <= 0) errors.quantityKg = "Enter the harvested quantity in kg, more than 0";
  if (wt && (!decOk(wt, 6) || Number(wt) <= 0)) errors.averageWeight = "Enter the average weight in grams, like 500";
  if (notes.length > 1000) errors.notes = "Notes must be 1000 characters or fewer";
  return { values: { batchId, harvestDate, quantityKg: Number(qty), averageWeight: wt ? Number(wt) : null, notes: notes || null }, errors };
}

export function validateSale(body) {
  const errors = {};
  const batchId = posInt(body?.batchId);
  const buyerName = text(body?.buyerName);
  const saleDate = text(String(body?.saleDate ?? ""));
  const qty = text(String(body?.quantityKg ?? ""));
  const price = text(String(body?.pricePerKg ?? ""));
  const paymentStatus = text(body?.paymentStatus) || "unpaid";
  if (!batchId) errors.batchId = "Choose a stocking batch";
  if (buyerName.length < 2 || buyerName.length > 100) errors.buyerName = "Enter the buyer name (2 to 100 characters)";
  if (!dateOk(saleDate)) errors.saleDate = "Choose the sale date";
  if (!decOk(qty, 8) || Number(qty) <= 0) errors.quantityKg = "Enter the quantity sold in kg, more than 0";
  if (!decOk(price, 8)) errors.pricePerKg = "Enter the price per kg, like 220";
  if (!PAYMENT_STATUSES.includes(paymentStatus)) errors.paymentStatus = "Choose Paid or Unpaid";
  return { values: { batchId, buyerName, saleDate, quantityKg: Number(qty), pricePerKg: Number(price), paymentStatus }, errors };
}

export function validateExpense(body) {
  const errors = {};
  const batchId = posInt(body?.batchId);
  const expenseDate = text(String(body?.expenseDate ?? ""));
  const expenseType = text(body?.expenseType);
  const amount = text(String(body?.amount ?? ""));
  const description = text(body?.description);
  if (!batchId) errors.batchId = "Choose a stocking batch";
  if (!dateOk(expenseDate)) errors.expenseDate = "Choose the expense date";
  if (!EXPENSE_TYPES.includes(expenseType)) errors.expenseType = "Choose a category";
  if (!decOk(amount, 10)) errors.amount = "Enter the amount, 0 or more";
  if (description.length > 1000) errors.description = "Description must be 1000 characters or fewer";
  return { values: { batchId, expenseDate, expenseType, amount: Number(amount), description: description || null }, errors };
}