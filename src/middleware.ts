import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // NextAuth v5 uses these cookie names (http vs https)
  const sessionToken =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!sessionToken;
  const pathname = req.nextUrl.pathname;

  const protectedPaths = ["/dashboard", "/cats"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cats/:path*",
    "/api/cats/:path*",
  ],
};