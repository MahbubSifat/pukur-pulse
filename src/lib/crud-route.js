import { ok, fail, isSameOrigin, readJson, handleError, parseId } from "@/lib/utils";
import { apiUser } from "@/lib/auth";

// Same guard order for every module: same-origin -> signed in -> valid id -> JSON -> validate -> service
async function guard(request, write) {
  if (write && !isSameOrigin(request)) return { error: fail("Cross-site request blocked", 403) };
  return apiUser();
}
async function parseBody(request, validate) {
  const body = await readJson(request);
  if (!body) return { error: fail("Request body must be valid JSON", 400) };
  const { values, errors } = validate(body);
  if (Object.keys(errors).length) return { error: fail("Please fix the highlighted fields", 422, errors) };
  return { values };
}

// svc = { list, get, create, update, remove }
export function collectionRoute(name, validate, svc) {
  return {
    async GET() {
      const { user, error } = await guard(null, false);
      if (error) return error;
      try { return ok({ items: await svc.list(user.userId) }); } catch (e) { return handleError(e, `${name}/list`); }
    },
    async POST(request) {
      const g = await guard(request, true);
      if (g.error) return g.error;
      const p = await parseBody(request, validate);
      if (p.error) return p.error;
      try { return ok({ item: await svc.create(g.user.userId, p.values) }, 201); } catch (e) { return handleError(e, `${name}/create`); }
    },
  };
}

export function itemRoute(name, validate, svc) {
  const idOf = async (params) => parseId((await params).id);
  return {
    async GET(_req, { params }) {
      const { user, error } = await guard(null, false);
      if (error) return error;
      const id = await idOf(params);
      if (!id) return fail("Record not found", 404);
      try { const item = await svc.get(user.userId, id); return item ? ok({ item }) : fail("Record not found", 404); } catch (e) { return handleError(e, `${name}/get`); }
    },
    async PATCH(request, { params }) {
      const g = await guard(request, true);
      if (g.error) return g.error;
      const id = await idOf(params);
      if (!id) return fail("Record not found", 404);
      const p = await parseBody(request, validate);
      if (p.error) return p.error;
      try { const item = await svc.update(g.user.userId, id, p.values); return item ? ok({ item }) : fail("Record not found", 404); } catch (e) { return handleError(e, `${name}/update`); }
    },
    async DELETE(request, { params }) {
      const g = await guard(request, true);
      if (g.error) return g.error;
      const id = await idOf(params);
      if (!id) return fail("Record not found", 404);
      try { return (await svc.remove(g.user.userId, id)) ? ok({ deleted: true }) : fail("Record not found", 404); } catch (e) { return handleError(e, `${name}/delete`); }
    },
  };
}