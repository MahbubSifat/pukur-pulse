import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Session = signed JWT in an HTTP-only cookie. It only carries the user id;
// everything else is read from MySQL on every request.
const COOKIE = "pp_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET missing or shorter than 32 characters (.env.local)");
  return new TextEncoder().encode(s);
}

// Call this BEFORE writing to the database, so a missing secret cannot leave a half-registered user
export function assertSessionConfig() {
  key();
}

export async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,                                  // JavaScript cannot read it
    secure: process.env.NODE_ENV === "production",   // HTTPS only in production
    sameSite: "lax",                                 // not sent on cross-site POST
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE);
}

export async function readSessionUserId() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return Number.isInteger(payload.userId) ? payload.userId : null;
  } catch {
    return null; // expired, tampered or wrong secret
  }
}