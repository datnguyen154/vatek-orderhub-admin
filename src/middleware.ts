import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 15 Middleware — Coarse Route Guard
 *
 * NOTE: Middleware executes at the Edge/request pipeline stage and MUST NOT import
 * server-only crypto/session signing modules. It performs a coarse check for the
 * presence of the demo session cookie on dashboard routes (`/orders/*` and `/preferences/*`).
 * Full cryptographic verification is executed by the dashboard Server Component layout.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes with coarse cookie-presence check
  if (pathname.startsWith("/orders") || pathname.startsWith("/preferences")) {
    const hasDemoCookie = request.cookies.has("orderhub_demo_session");

    if (!hasDemoCookie) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*", "/preferences/:path*"],
};
