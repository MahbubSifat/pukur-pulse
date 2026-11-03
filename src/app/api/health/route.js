import { query } from "@/lib/db/pool";
import { ok, fail } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const [row] = await query("SELECT DATABASE() AS db, VERSION() AS version, NOW() AS server_time");
    return ok({ status: "connected", ...row });
  } catch (err) {
    console.error("[health] DB connection failed:", err.code || err.message);
    return fail("Database connection failed", 503, err.code);
  }
}