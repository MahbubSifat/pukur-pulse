import { requireUser } from "@/lib/auth/dal";
import Logo from "@/components/ui/Logo";
import LogoutButton from "@/components/layout/LogoutButton";

export const metadata = { title: "Dashboard" };

const ROLE_LABEL = { farmer: "Farmer", officer: "Fisheries Officer" };

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <Logo />
        <LogoutButton />
      </header>
      <section className="rounded-xl border border-line bg-surface p-6">
        <p className="text-sm text-muted">Signed in as</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{user.fullName ?? user.username}</h1>
        <p className="mt-3 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-900">
          {ROLE_LABEL[user.role]}
        </p>
        <p className="mt-6 text-sm text-muted">
          The full dashboard with charts and statistics arrives in a later phase. This page confirms that login,
          session and role detection work.
        </p>
      </section>
    </main>
  );
}