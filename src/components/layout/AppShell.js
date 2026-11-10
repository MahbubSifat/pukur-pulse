"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Waves, Fish, Activity, Scale, Database, PanelLeftClose, PanelLeftOpen, Menu, X, LogOut } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { send } from "@/lib/api-client";

// Only pages that exist are listed here. New modules get added to this array.
const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ponds", label: "Ponds", icon: Waves },
  { href: "/batches", label: "Stocking Batches", icon: Fish },
  { href: "/monitoring", label: "Feed & Water", icon: Activity },
  { href: "/harvest-sales", label: "Harvest & Sales", icon: Scale },
  { href: "/mysql-lab", label: "MySQL Lab", icon: Database },
];

export default function AppShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  async function logout() {
    await send("POST", "/api/auth/logout");
    router.replace("/login");
    router.refresh();
  }

  const initials = user.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const sidebar = (
    <nav aria-label="Main" className="flex h-full flex-col bg-brand-900 text-brand-100">
      <div className={`flex h-16 items-center ${collapsed ? "justify-center" : "px-5"}`}>
        <Logo inverted showText={!collapsed} size={32} />
      </div>
      <ul className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link href={href} onClick={() => setOpen(false)} title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-white/15 text-white" : "hover:bg-white/10"} ${collapsed ? "justify-center" : ""}`}>
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {!collapsed && label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button onClick={() => setCollapsed((c) => !c)} className="m-3 hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/10 lg:flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <PanelLeftOpen className="h-5 w-5" aria-hidden="true" /> : <><PanelLeftClose className="h-5 w-5" aria-hidden="true" />Collapse</>}
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 lg:block ${collapsed ? "w-[72px]" : "w-64"}`}>{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[72px]" : "lg:pl-64"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-8">
          <button onClick={() => setOpen((o) => !o)} aria-label="Open menu" className="rounded-md p-2 text-muted hover:bg-canvas lg:hidden">
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
          <p className="hidden text-sm text-muted lg:block">Track Your Pond. Understand Your Farm.</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-900" aria-hidden="true">{initials}</span>
              <div className="hidden text-sm leading-tight sm:block">
                <p className="font-semibold text-ink">{user.fullName}</p>
                <p className="text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-canvas">
              <LogOut className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}