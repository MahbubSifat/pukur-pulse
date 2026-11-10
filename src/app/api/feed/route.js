import { ok, fail, isSameOrigin, readJson, handleError } from "@/lib/utils";
import { apiUser } from "@/lib/auth";
import { validateFeed } from "@/lib/validations";
import { listFeed, createFeed } from "@/services/feed.service";

export async function GET() {
  const { user, error } = await apiUser();
  if (error) return error;
  try {
    return ok({ items: await listFeed(user.userId) });
  } catch (err) {
    return handleError(err, "feed/list");
  }
}

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const body = await readJson(request);
  if (!body) return fail("Request body must be valid JSON", 400);
  const { values, errors } = validateFeed(body);
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 422, errors);
  try {
    return ok({ item: await createFeed(user.userId, values) }, 201);
  } catch (err) {
    return handleError(err, "feed/create");
  }
}
