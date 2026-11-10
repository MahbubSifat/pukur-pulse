import { redirect } from "next/navigation";
import { Waves, LineChart, ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { getCurrentUser } from "@/lib/auth";

const POINTS = [
  { icon: Waves, text: "Record ponds, fish stocking, feed and water quality in one place" },
  { icon: LineChart, text: "See feed cost, sales and estimated profit for every batch" },
  { icon: ShieldCheck, text: "Your farm records stay private to your account" },
];

export default async function AuthLayout({ children }) {
  if (await getCurrentUser()) redirect("/dashboard"); // already signed in
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-12 text-brand-100 lg:flex">
        <svg aria-hidden="true" className="absolute -bottom-10 left-0 w-full text-brand-700/40" viewBox="0 0 800 200" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M0 60 q50 -30 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" />
          <path d="M0 110 q50 -30 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" />
          <path d="M0 160 q50 -30 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" />
        </svg>
        <Logo inverted />
        <div className="relative">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Track Your Pond.
            <br />
            Understand Your Farm.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm leading-relaxed">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-brand-100/80">Pond &amp; fish farm management</p>
      </aside>
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
