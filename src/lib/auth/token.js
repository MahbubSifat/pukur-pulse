import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "pp_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith("replace_with")) {
    throw new Error("SESSION_SECRET is missing or too short (need 32+ characters). Check .env.local");
  }
  return new TextEncoder().encode(secret);
}

// Token-এর ভেতরে শুধু userId আর role থাকে। বাকি সব তথ্য প্রতিবার database থেকে আসে।
export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getKey());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  const key = getKey(); // ভুল config হলে এখানেই জোরে error আসবে, চুপচাপ গিলে ফেলবে না
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null; // মেয়াদ শেষ, বদলানো, বা ভুল secret
  }
}