import { Waves, LineChart, ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";

const POINTS = [
  { icon: Waves, text: "Track water quality and get alerts when readings go out of range" },
  { icon: LineChart, text: "See feed, expense and sales numbers for every stocking batch" },
  { icon: ShieldCheck, text: "Your farm records stay private to your account" },
];

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-brand-900 p-12 text-brand-100 lg:flex">
        <Logo inverted />
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Monitor Your Pond.
            <br />
            Manage Your Costs.
            <br />
            Maximize Your Profit.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm leading-relaxed">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-100" aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-brand-100/80">Smart aquaculture and fish farm management</p>
      </aside>
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}