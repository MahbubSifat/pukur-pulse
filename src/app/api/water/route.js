import { ok, fail, isSameOrigin, readJson, handleError } from "@/lib/utils";
import { apiUser } from "@/lib/auth";
import { validateWater } from "@/lib/validations";
import { listWater, createWater } from "@/services/water.service";

export async function GET() {
  const { user, error } = await apiUser();
  if (error) return error;
  try {
    return ok({ items: await listWater(user.userId) });
  } catch (err) {
    return handleError(err, "water/list");
  }
}

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const body = await readJson(request);
  if (!body) return fail("Request body must be valid JSON", 400);
  const { values, errors } = validateWater(body);
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 422, errors);
  try {
    return ok({ item: await createWater(user.userId, values) }, 201);
  } catch (err) {
    return handleError(err, "water/create");
  }
}
