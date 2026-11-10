import { requireUser } from "@/lib/auth";
import { listBatches, listFinancials } from "@/services/batch.service";
import * as harvest from "@/services/harvest.service";
import * as sales from "@/services/sales.service";
import * as expenses from "@/services/expenses.service";
import HarvestSalesClient from "@/components/forms/HarvestSalesClient";

export const metadata = { title: "Harvest & Sales" };

export default async function HarvestSalesPage() {
  const { userId } = await requireUser();
  const [h, s, e, summary, batches] = await Promise.all([harvest.list(userId), sales.list(userId), expenses.list(userId), listFinancials(userId), listBatches(userId)]);
  return <HarvestSalesClient harvest={h} sales={s} expenses={e} summary={summary} batches={batches} />;
}