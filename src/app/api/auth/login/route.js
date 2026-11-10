import { ok, fail, isSameOrigin, readJson, serverError } from "@/lib/utils";
import { validateLogin } from "@/lib/validations";
import { verifyPassword, burnTime } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { findUserByEmail } from "@/services/auth.service";

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);
  const body = await readJson(request);
  if (!body) return fail("Request body must be valid JSON", 400);

  const { values, errors } = validateLogin(body);
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields", 422, errors);

  try {
    const user = await findUserByEmail(values.email);
    let good = false;
    if (user) good = await verifyPassword(values.password, user.passwordHash);
    else await burnTime(values.password);

    // One message for "wrong email" and "wrong password": nothing leaks
    if (!user || !good) return fail("Invalid email or password", 401);

    await createSession(user.userId);
    return ok({ redirectTo: "/dashboard" });
  } catch (err) {
    return serverError(err, "auth/login");
  }
}
