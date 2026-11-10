import { requireUser } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";

// Every page inside (dashboard) is protected here: no valid session -> /login
export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  return <AppShell user={user}>{children}</AppShell>;
}
