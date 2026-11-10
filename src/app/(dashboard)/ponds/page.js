import { requireUser } from "@/lib/auth";
import { listPonds } from "@/services/pond.service";
import PondsClient from "@/components/forms/PondsClient";

export const metadata = { title: "Ponds" };

export default async function PondsPage() {
  const user = await requireUser();
  return <PondsClient ponds={await listPonds(user.userId)} />;
}
