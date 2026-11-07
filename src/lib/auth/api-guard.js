import "server-only";
import { getCurrentUser } from "@/lib/auth/dal";
import { fail } from "@/lib/utils/api-response";

// Route Handler-এ ব্যবহার: const { user, error } = await authorize(["farmer"]);
export async function authorize(roles) {
  const user = await getCurrentUser();
  if (!user) return { error: fail("Authentication required", 401) };
  if (roles && !roles.includes(user.role)) {
    return { error: fail("You do not have permission to do this", 403) };
  }
  return { user };
}