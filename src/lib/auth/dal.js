import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";
import { findUserById } from "@/services/auth.service";

// Data Access Layer: আসল নিরাপত্তা যাচাই এখানে।
// Cookie ঠিক থাকলেও database থেকে দেখা হয় user এখনো আছে আর active কিনা।
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session?.userId) return null;

  const user = await findUserById(session.userId);
  if (!user || !user.isActive) return null;

  return {
    userId: user.userId,
    username: user.username,
    role: user.role,
    farmerId: user.farmerId,
    fullName: user.fullName,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/unauthorized");
  return user;
}