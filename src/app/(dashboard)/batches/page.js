import { requireUser } from "@/lib/auth";
import { listBatches, listActivePonds, listSpecies } from "@/services/batch.service";
import BatchesClient from "@/components/forms/BatchesClient";

export const metadata = { title: "Stocking batches" };

export default async function BatchesPage() {
  const user = await requireUser();
  const [batches, ponds, species] = await Promise.all([listBatches(user.userId), listActivePonds(user.userId), listSpecies()]);
  return <BatchesClient batches={batches} ponds={ponds} species={species} />;
}
