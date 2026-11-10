import fs from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/auth";
import { TOPICS, CATEGORIES } from "@/data/lab-topics.mjs";
import LabClient from "@/components/forms/LabClient";

export const metadata = { title: "MySQL Lab" };

// Results come from `npm run lab:verify` (real MySQL output). If the file is missing, topics show "Not run".
async function readResults() {
  try {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), "src/data/lab-results.json"), "utf8"));
  } catch {
    return null;
  }
}

export default async function MysqlLabPage() {
  await requireUser();
  const data = await readResults();
  const topics = TOPICS.map((t) => ({ ...t, result: data?.results?.[t.n] ?? null }));
  const meta = data ? { mysqlVersion: data.mysqlVersion, generatedAt: data.generatedAt } : null;
  return <LabClient topics={topics} categories={CATEGORIES} meta={meta} />;
}