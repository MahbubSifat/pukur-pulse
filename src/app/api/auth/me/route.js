import { ok } from "@/lib/utils/api-response";
import { authorize } from "@/lib/auth/api-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await authorize();
  if (error) return error;
  return ok({ user });
}