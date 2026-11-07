// অন্য সাইট থেকে পাঠানো POST আটকানোর অতিরিক্ত স্তর (SameSite cookie-র সাথে)
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Postman/curl-এর মতো browser-বহির্ভূত client Origin পাঠায় না
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}