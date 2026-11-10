import { ok, fail, isSameOrigin, readJson, handleError, parseId } from "@/lib/utils";
import { apiUser } from "@/lib/auth";
import { validateFeed } from "@/lib/validations";
import { getFeed, updateFeed, deleteFeed } from "@/services/feed.service";

export async function GET(_req, { params }) {
  const { user, error } = await apiUser();
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return fail("Record not found", 404);
  try {
    const item = await getFeed(user.userId, id);
    return item ? ok({ item }) : fail("Record not found", 404);
  } catch (err) {
    return handleError(err, "feed/get");
  }
}

export async function PATCH(request, { params }) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return fail("Record not found", 404);
  const body = await readJson(request);
  if (!body) return fail("Request body must be valid JSON", 400);
  const { values, errors } = validateFeed(body);
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 422, errors);
  try {
    const item = await updateFeed(user.userId, id, values);
    return item ? ok({ item }) : fail("Record not found", 404);
  } catch (err) {
    return handleError(err, "feed/update");
  }
}

export async function DELETE(request, { params }) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const { user, error } = await apiUser();
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return fail("Record not found", 404);
  try {
    return (await deleteFeed(user.userId, id)) ? ok({ deleted: true }) : fail("Record not found", 404);
  } catch (err) {
    return handleError(err, "feed/delete");
  }
}
