import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/auth/token";

export async function createSession(user) {
  const token = await signSession({ userId: user.userId, role: user.role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript এই cookie পড়তে পারবে না
    secure: process.env.NODE_ENV === "production", // production-এ শুধু HTTPS-এ
    sameSite: "lax", // অন্য সাইট থেকে আসা POST-এ cookie যাবে না
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}