import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-c61_session" : "c61_session";
const PROTECTED = ["/dashboard", "/account", "/orders", "/licenses", "/wishlist", "/checkout", "/seller", "/admin"];

/**
 * Edge middleware only does a cheap presence check to redirect anonymous users.
 * Real authentication + RBAC is enforced server-side (getCurrentUser/requireRole).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!req.cookies.get(SESSION_COOKIE)) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|images).*)"] };
