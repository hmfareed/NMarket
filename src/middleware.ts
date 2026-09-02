import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const SESSION_COOKIE_NAME = "nmarket_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "nmarket_default_super_secure_secret_key_change_me_32_chars"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth =
    pathname.startsWith("/seller") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/rider");

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload as { role?: string }).role;

    // RBAC Role checks
    if (pathname.startsWith("/admin")) {
      const adminRoles = [
        "SUPER_ADMIN",
        "OPERATIONS_ADMIN",
        "FINANCE_ADMIN",
        "SUPPORT",
      ];
      if (!role || !adminRoles.includes(role)) {
        return NextResponse.redirect(new URL("/?error=unauthorized_admin", request.url));
      }
    }

    if (pathname.startsWith("/seller")) {
      if (role !== "SELLER" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/?error=unauthorized_seller", request.url));
      }
    }

    if (pathname.startsWith("/rider")) {
      if (role !== "RIDER" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/?error=unauthorized_rider", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/seller/:path*", "/admin/:path*", "/rider/:path*"],
};
