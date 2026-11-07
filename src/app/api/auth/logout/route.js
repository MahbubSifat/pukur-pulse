import { ok, fail } from "@/lib/utils/api-response";
import { isSameOrigin } from "@/lib/utils/same-origin";
import { deleteSession } from "@/lib/auth/session";

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  await deleteSession();
  return ok({ loggedOut: true });
}