"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import PasswordToggle from "@/components/forms/PasswordToggle";
import { validateRegistration } from "@/lib/validations";
import { send } from "@/lib/api-client";

const EMPTY = { fullName: "", email: "", phone: "", password: "", confirmPassword: "" };

export default function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
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
    const check = validateRegistration(values);
    if (Object.keys(check.errors).length) return setErrors(check.errors);

    setLoading(true);
    const res = await send("POST", "/api/auth/register", values);
    setLoading(false);
    if (!res.ok) {
      if (res.details) setErrors(res.details);
      else setFormError(res.error);
      return;
    }
    router.replace(res.data.redirectTo);
    router.refresh();
  }

  const toggle = <PasswordToggle shown={show} onToggle={() => setShow((s) => !s)} />;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger-bg px-3.5 py-3 text-sm text-danger-text">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}
      <TextField id="fullName" name="fullName" label="Full name" placeholder="e.g. Abdul Karim" autoComplete="name"
        required value={values.fullName} onChange={onChange} error={errors.fullName} />
      <TextField id="email" name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email"
        required value={values.email} onChange={onChange} error={errors.email} />
      <TextField id="phone" name="phone" type="tel" inputMode="tel" label="Phone number" placeholder="01712345678"
        autoComplete="tel" hint="Bangladeshi mobile number" required value={values.phone} onChange={onChange} error={errors.phone} />
      <TextField id="password" name="password" type={show ? "text" : "password"} label="Password" autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number" required value={values.password} onChange={onChange}
        error={errors.password} rightSlot={toggle} />
      <TextField id="confirmPassword" name="confirmPassword" type={show ? "text" : "password"} label="Confirm password"
        autoComplete="new-password" required value={values.confirmPassword} onChange={onChange} error={errors.confirmPassword} />
      <Button type="submit" loading={loading} className="w-full">{loading ? "Creating account…" : "Create account"}</Button>
    </form>
  );
}
