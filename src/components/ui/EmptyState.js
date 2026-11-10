export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-900">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mb-5 mt-1 max-w-sm text-sm text-muted">{text}</p>
      {children}
    </div>
  );
}
