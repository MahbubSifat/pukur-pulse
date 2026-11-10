"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import PasswordToggle from "@/components/forms/PasswordToggle";
import { validateLogin } from "@/lib/validations";
import { send } from "@/lib/api-client";

export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((x) => ({ ...x, [e.target.name]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setFormError("");
    const check = validateLogin(values);
    if (Object.keys(check.errors).length) return setErrors(check.errors);

    setLoading(true);
    const res = await send("POST", "/api/auth/login", values);
    setLoading(false);
    if (!res.ok) {
      if (res.details) setErrors(res.details);
      else setFormError(res.error);
      return;
    }
    router.replace(res.data.redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger-bg px-3.5 py-3 text-sm text-danger-text">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}
      <TextField id="email" name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email"
        required value={values.email} onChange={onChange} error={errors.email} />
      <TextField id="password" name="password" type={show ? "text" : "password"} label="Password" autoComplete="current-password"
        required value={values.password} onChange={onChange} error={errors.password}
        rightSlot={<PasswordToggle shown={show} onToggle={() => setShow((s) => !s)} />} />
      <Button type="submit" loading={loading} className="w-full">{loading ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
