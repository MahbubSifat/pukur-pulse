import { ok, fail, isSameOrigin, readJson, handleError } from "@/lib/utils";
import { apiUser } from "@/lib/auth";
import { validatePond } from "@/lib/validations";
import { listPonds, createPond } from "@/services/pond.service";

export async function GET() {
  const { user, error } = await apiUser();
  if (error) return error;
  try {
    return ok({ ponds: await listPonds(user.userId) });
  } catch (err) {
    return handleError(err, "ponds/list");
  }
}

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const body = await readJson(request);
  if (!body) return fail("Request body must be valid JSON", 400);

  const { values, errors } = validatePond(body);
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 422, errors);
  try {
    // owner = logged-in user, any user id in the body is ignored
    return ok({ pond: await createPond(user.userId, values) }, 201);
  } catch (err) {
    return handleError(err, "ponds/create");
  }
}
