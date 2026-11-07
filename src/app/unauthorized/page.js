import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata = { title: "Access denied" };

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-warn-bg text-warn-text">
        <ShieldAlert className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">You don’t have access to this page</h1>
      <p className="mt-2 text-sm text-muted">
        Your account role does not allow this action. If you think this is a mistake, contact your administrator.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-900"
      >
        Back to dashboard
      </Link>
    </main>
  );
}