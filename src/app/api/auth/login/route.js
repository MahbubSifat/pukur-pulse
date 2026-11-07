import { ok, fail, serverError } from "@/lib/utils/api-response";
import { isSameOrigin } from "@/lib/utils/same-origin";
import { validateLogin } from "@/lib/validation/auth";
import { findUserByUsername } from "@/services/auth.service";
import { verifyPassword, burnTime } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Request body must be valid JSON", 400);
  }

  const { values, errors } = validateLogin(body);
  if (Object.keys(errors).length > 0) return fail("Please fix the highlighted fields", 422, errors);

  try {
    const user = await findUserByUsername(values.username);

    let passwordOk = false;
    if (user) passwordOk = await verifyPassword(values.password, user.passwordHash);
    else await burnTime(values.password);

    // এক ধরনের বার্তা: username ভুল, password ভুল বা account বন্ধ, বাইরে থেকে আলাদা বোঝা যাবে না
    if (!user || !passwordOk || !user.isActive) return fail("Invalid username or password", 401);

    await createSession(user);
    return ok({
      user: { userId: user.userId, username: user.username, role: user.role, fullName: user.fullName },
      redirectTo: "/dashboard",
    });
  } catch (err) {
    return serverError(err, "auth/login");
  }
}