import { ok, fail, serverError } from "@/lib/utils/api-response";
import { isSameOrigin } from "@/lib/utils/same-origin";
import { validateRegistration } from "@/lib/validation/auth";
import { registerFarmer } from "@/services/auth.service";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

// Database-এর UNIQUE নিয়ম হলো শেষ পাহারা: দুজন একসাথে একই phone/username নিতে চাইলেও একজনই পাবে।
function duplicateFieldError(err) {
  if (err?.code !== "ER_DUP_ENTRY") return null;
  const msg = err.sqlMessage || "";
  if (msg.includes("uq_farmers_phone")) return { phone: "This phone number is already registered" };
  if (msg.includes("uq_app_users_username")) return { username: "This username is already taken" };
  return null;
}

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Cross-site request blocked", 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Request body must be valid JSON", 400);
  }

  const { values, errors } = validateRegistration(body);
  if (Object.keys(errors).length > 0) return fail("Please fix the highlighted fields", 422, errors);

  try {
    const passwordHash = await hashPassword(values.password);
    const user = await registerFarmer({ ...values, passwordHash });
    await createSession(user); // নিবন্ধনের পরেই লগইন
    return ok(
      {
        user: { userId: user.userId, username: user.username, role: user.role, fullName: user.fullName },
        redirectTo: "/dashboard",
      },
      201
    );
  } catch (err) {
    const duplicate = duplicateFieldError(err);
    if (duplicate) return fail("Please fix the highlighted fields", 409, duplicate);
    return serverError(err, "auth/register");
  }
}