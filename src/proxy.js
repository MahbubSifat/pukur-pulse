import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

// Proxy শুধু "দ্রুত পূর্বাভাস" দেয়: cookie দেখে redirect করে, database ছোঁয় না।
// আসল নিরাপত্তা যাচাই হয় dal.js আর api-guard.js-এ।
const AUTH_PAGES = ["/login", "/register"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!session && !isAuthPage && pathname !== "/unauthorized") {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && (isAuthPage || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// API আর static file বাদ: API নিজেই 401 JSON দেয়, redirect নয়
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};