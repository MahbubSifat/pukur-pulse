const TONES = {
  success: "bg-brand-100 text-brand-900",
  warning: "bg-warn-bg text-warn-text",
  danger: "bg-danger-bg text-danger-text",
  info: "bg-sky-soft text-aqua-700",
  neutral: "bg-line/60 text-muted",
};
export default function Badge({ tone = "neutral", children }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{children}</span>;
}

const STATUS_TONE = { active: "success", maintenance: "warning", inactive: "neutral", harvesting: "info", completed: "neutral" };
export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}
