import { ok, fail, isSameOrigin, readJson, handleError, parseId } from "@/lib/utils";
import { apiUser } from "@/lib/auth";
import { validatePond } from "@/lib/validations";
import { getPond, updatePond, deletePond } from "@/services/pond.service";

export async function GET(_req, { params }) {
  const { user, error } = await apiUser();
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return fail("Pond not found", 404);
  try {
    const pond = await getPond(user.userId, id);
    return pond ? ok({ pond }) : fail("Pond not found", 404);
  } catch (err) {
    return handleError(err, "ponds/get");
  }
}

export async function PATCH(request, { params }) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return fail("Pond not found", 404);
  const body = await readJson(request);
  if (!body) return fail("Request body must be valid JSON", 400);

  const { values, errors } = validatePond(body);
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 422, errors);
  try {
    const pond = await updatePond(user.userId, id, values);
    return pond ? ok({ pond }) : fail("Pond not found", 404); // someone else's pond = 404 too
  } catch (err) {
    return handleError(err, "ponds/update");
  }
}

export async function DELETE(request, { params }) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return fail("Pond not found", 404);
  try {
    return (await deletePond(user.userId, id)) ? ok({ deleted: true }) : fail("Pond not found", 404);
  } catch (err) {
    return handleError(err, "ponds/delete");
  }
}
