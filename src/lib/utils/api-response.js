import { NextResponse } from "next/server";

export const ok = (data, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const fail = (message, status = 400, details) =>
  NextResponse.json({ success: false, error: { message, details } }, { status });

// অপ্রত্যাশিত ভুল: আসল কারণ server log-এ, user-কে শুধু সাধারণ বার্তা
export function serverError(err, where = "api") {
  console.error(`[${where}]`, err);
  return fail("Something went wrong. Please try again.", 500);
}