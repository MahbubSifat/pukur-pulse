import { ok, fail, isSameOrigin } from "@/lib/utils";
import { deleteSession } from "@/lib/session";

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  await deleteSession();
  return ok({ loggedOut: true });
}
