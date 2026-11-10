import { ok, fail, isSameOrigin, readJson, handleError, parseId } from "@/lib/utils";
import { apiUser } from "@/lib/auth";
import { validateBatch } from "@/lib/validations";
import { getBatch, updateBatch, deleteBatch } from "@/services/batch.service";

export async function GET(_req, { params }) {
  const { user, error } = await apiUser();
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return fail("Batch not found", 404);
  try {
    const batch = await getBatch(user.userId, id);
    return batch ? ok({ batch }) : fail("Batch not found", 404);
  } catch (err) {
    return handleError(err, "batches/get");
  }
}

export async function PATCH(request, { params }) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return fail("Batch not found", 404);
  const body = await readJson(request);
  if (!body) return fail("Request body must be valid JSON", 400);

  const { values, errors } = validateBatch(body, { isEdit: true });
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 422, errors);
  try {
    const batch = await updateBatch(user.userId, id, values);
    return batch ? ok({ batch }) : fail("Batch not found", 404);
  } catch (err) {
    return handleError(err, "batches/update");
  }
}

export async function DELETE(request, { params }) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return fail("Batch not found", 404);
  try {
    return (await deleteBatch(user.userId, id)) ? ok({ deleted: true }) : fail("Batch not found", 404);
  } catch (err) {
    return handleError(err, "batches/delete");
  }
}
