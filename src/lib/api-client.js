// Small fetch helper for client components: always returns { ok, data, error, details }
export async function send(method, url, body) {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error?.message || "Request failed", details: json.error?.details };
    return { ok: true, data: json.data };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection." };
  }
}
