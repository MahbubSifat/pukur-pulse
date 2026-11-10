import { requireUser } from "@/lib/auth";
import { listFeed } from "@/services/feed.service";
import { listWater } from "@/services/water.service";
import { listBatches } from "@/services/batch.service";
import { listPonds } from "@/services/pond.service";
import MonitoringClient from "@/components/forms/MonitoringClient";

export const metadata = { title: "Feed & Water" };

export default async function MonitoringPage() {
  const user = await requireUser();
  const [feed, water, batches, ponds] = await Promise.all([listFeed(user.userId), listWater(user.userId), listBatches(user.userId), listPonds(user.userId)]);
  return <MonitoringClient feed={feed} water={water} batches={batches} ponds={ponds} />;
}
