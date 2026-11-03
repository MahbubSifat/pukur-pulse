import { NextResponse } from "next/server";

export const ok = (data, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const fail = (message, status = 400, details) =>
  NextResponse.json({ success: false, error: { message, details } }, { status });