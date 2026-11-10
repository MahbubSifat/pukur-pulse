import { cache } from "react";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { readSessionUserId } from "@/lib/session";
import { findUserById } from "@/services/auth.service";
import { fail } from "@/lib/utils";

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// If the email does not exist we still spend the same time, so timing cannot reveal it.
let dummy;
export async function burnTime(plain) {
  dummy ??= bcrypt.hash(randomBytes(16).toString("hex"), 10);
  await bcrypt.compare(plain, await dummy);
}

// The user id ALWAYS comes from the verified cookie, never from the request body.
export const getCurrentUser = cache(async () => {
  const userId = await readSessionUserId();
  return userId ? findUserById(userId) : null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// For API route handlers
export async function apiUser() {
  const user = await getCurrentUser();
  return user ? { user } : { error: fail("Please sign in first", 401) };
}
