// Pukur Pulse-এর নিজস্ব লোগো: পুকুরের ঢেউ আর একটা মাছ
export default function Logo({ size = 36, inverted = false, showText = true }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Pukur Pulse logo">
        <rect width="48" height="48" rx="12" fill={inverted ? "#ffffff" : "#15803d"} />
        <ellipse cx="22" cy="19" rx="8.5" ry="4.8" fill={inverted ? "#14532d" : "#ffffff"} />
        <polygon points="29.5,19 36,14.5 36,23.5" fill={inverted ? "#14532d" : "#ffffff"} />
        <circle cx="17.5" cy="17.8" r="1.1" fill={inverted ? "#ffffff" : "#15803d"} />
        <path
          d="M9 30.5 q3.75 -3.2 7.5 0 t7.5 0 t7.5 0 t7.5 0 M9 36.5 q3.75 -3.2 7.5 0 t7.5 0 t7.5 0 t7.5 0"
          fill="none"
          stroke={inverted ? "#14532d" : "#ffffff"}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className={`text-lg font-semibold tracking-tight ${inverted ? "text-white" : "text-brand-900"}`}>
          Pukur Pulse
        </span>
      )}
    </span>
  );
}