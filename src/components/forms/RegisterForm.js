"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { validateRegistration } from "@/lib/validation/auth";

const EMPTY = { fullName: "", phone: "", address: "", username: "", password: "", confirmPassword: "" };
const FIELD_ORDER = ["fullName", "phone", "address", "username", "password", "confirmPassword"];

// প্রথম ভুল ঘরে cursor নিয়ে যায় (keyboard আর screen reader ব্যবহারকারীর জন্য)
function focusFirstError(errors) {
  const first = FIELD_ORDER.find((key) => errors[key]);
  if (first) requestAnimationFrame(() => document.getElementById(first)?.focus());
}

export default function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setFieldErrors((errs) => ({ ...errs, [e.target.name]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setFormError("");

    const { errors } = validateRegistration(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      focusFirstError(errors);
      return;
    }

    setLoading(true);
    setFieldErrors({});
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error?.details) {
          setFieldErrors(json.error.details);
          focusFirstError(json.error.details);
        } else {
          setFormError(json.error?.message || "Could not create the account. Please try again.");
        }
        return;
      }
      router.replace(json.data.redirectTo);
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      aria-label={showPassword ? "Hide passwords" : "Show passwords"}
      className="rounded-md p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
    >
      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
    </button>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger-bg px-3.5 py-3 text-sm text-danger-text">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <TextField
        id="fullName"
        name="fullName"
        label="Full name"
        placeholder="e.g. Abdul Karim"
        autoComplete="name"
        required
        value={values.fullName}
        onChange={onChange}
        error={fieldErrors.fullName}
      />

      <TextField
        id="phone"
        name="phone"
        label="Mobile number"
        type="tel"
        inputMode="tel"
        placeholder="01712345678"
        autoComplete="tel"
        hint="Bangladeshi mobile number"
        required
        value={values.phone}
        onChange={onChange}
        error={fieldErrors.phone}
      />

      <TextField
        id="address"
        name="address"
        label="Address (optional)"
        placeholder="Village, upazila, district"
        autoComplete="street-address"
        value={values.address}
        onChange={onChange}
        error={fieldErrors.address}
      />

      <TextField
        id="username"
        name="username"
        label="Username"
        placeholder="e.g. karim"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        hint="3 to 30 letters, numbers, dots or underscores"
        required
        value={values.username}
        onChange={onChange}
        error={fieldErrors.username}
      />

      <TextField
        id="password"
        name="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number"
        required
        value={values.password}
        onChange={onChange}
        error={fieldErrors.password}
        rightSlot={passwordToggle}
      />

      <TextField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        required
        value={values.confirmPassword}
        onChange={onChange}
        error={fieldErrors.confirmPassword}
      />

      <Button type="submit" loading={loading} className="w-full">
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}