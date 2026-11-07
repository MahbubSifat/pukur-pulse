import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-brand-700 text-white hover:bg-brand-900",
  secondary: "border border-line bg-surface text-ink hover:bg-canvas",
  ghost: "text-muted hover:bg-brand-50 hover:text-brand-900",
};

export default function Button({ children, variant = "primary", loading = false, disabled, className = "", ...props }) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}