import { ok, fail, isSameOrigin, readJson, handleError } from "@/lib/utils";
import { validateRegistration } from "@/lib/validations";
import { hashPassword } from "@/lib/auth";
  import { createSession, assertSessionConfig } from "@/lib/session";
import { createUser } from "@/services/auth.service";

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const body = await readJson(request);
  if (!body) return fail("Request body must be valid JSON", 400);

  const { values, errors } = validateRegistration(body);
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 422, errors);

  try {
        assertSessionConfig(); // fail early (before inserting the user) if SESSION_SECRET is not set
    // UNIQUE constraints in MySQL are the final guard against duplicate email/phone
    const userId = await createUser({ ...values, passwordHash: await hashPassword(values.password) });
    await createSession(userId);
    return ok({ redirectTo: "/dashboard" }, 201);
  } catch (err) {
    return handleError(err, "auth/register");
  }
}
