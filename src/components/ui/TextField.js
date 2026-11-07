export default function TextField({ id, label, error, hint, type = "text", rightSlot, className = "", ...props }) {
  const describedBy = [error && `${id}-error`, hint && !error && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`block w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors duration-150 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/25 ${
            error ? "border-danger" : "border-line"
          } ${rightSlot ? "pr-11" : ""}`}
          {...props}
        />
        {rightSlot && <div className="absolute inset-y-0 right-1.5 flex items-center">{rightSlot}</div>}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
}