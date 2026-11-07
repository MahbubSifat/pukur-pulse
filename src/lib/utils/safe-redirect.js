// Login-এর পর কোথায় যাবে: শুধু নিজের সাইটের ভেতরের path, বাইরের ঠিকানা নয়
export function safeNext(next, fallback = "/dashboard") {
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}