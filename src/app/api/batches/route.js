import { ok, fail, isSameOrigin, readJson, handleError } from "@/lib/utils";
import { apiUser } from "@/lib/auth";
import { validateBatch } from "@/lib/validations";
import { listBatches, createBatch } from "@/services/batch.service";

export async function GET() {
  const { user, error } = await apiUser();
  if (error) return error;
  try {
    return ok({ batches: await listBatches(user.userId) });
  } catch (err) {
    return handleError(err, "batches/list");
  }
}

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const body = await readJson(request);
  if (!body) return fail("Request body must be valid JSON", 400);

  const { values, errors } = validateBatch(body);
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 422, errors);
  try {
    return ok({ batch: await createBatch(user.userId, values) }, 201);
  } catch (err) {
    return handleError(err, "batches/create");
  }
}
