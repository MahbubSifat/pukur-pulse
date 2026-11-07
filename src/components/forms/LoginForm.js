"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { safeNext } from "@/lib/utils/safe-redirect";

// শুধু development-এ দেখায়: teacher-কে দ্রুত দেখানোর জন্য demo account বাটন
const DEMO_ACCOUNTS = [
  { label: "Farmer demo", username: "karim", password: "Farmer@123" },
  { label: "Officer demo", username: "officer1", password: "Officer@123" },
];

export default function LoginForm({ next }) {
  const router = useRouter();
  const [values, setValues] = useState({ username: "", password: "" });
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
    setLoading(true);
    setFormError("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error?.details) setFieldErrors(json.error.details);
        else setFormError(json.error?.message || "Could not sign in. Please try again.");
        return;
      }
      router.replace(safeNext(next, json.data.redirectTo));
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger-bg px-3.5 py-3 text-sm text-danger-text">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <TextField
        id="username"
        name="username"
        label="Username"
        placeholder="e.g. karim"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
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
        placeholder="Your password"
        autoComplete="current-password"
        required
        value={values.password}
        onChange={onChange}
        error={fieldErrors.password}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="rounded-md p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        }
      />

      <Button type="submit" loading={loading} className="w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>

      {process.env.NODE_ENV !== "production" && (
        <div className="border-t border-line pt-5">
          <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted">Development demo accounts</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <Button
                key={a.username}
                type="button"
                variant="secondary"
                className="!px-3 !py-1.5 text-xs"
                onClick={() => setValues({ username: a.username, password: a.password })}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}