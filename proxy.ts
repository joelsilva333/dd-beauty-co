import { adminSessionSecret } from "@/lib/admin-secret";
import { customerSessionSecret } from "@/lib/customer-secret";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "dd_admin_session";
const CUSTOMER_COOKIE_NAME = "dd_customer_session";

// Páginas de conta que não exigem sessão (o próprio fluxo de entrar/criar/Google).
const CUSTOMER_PUBLIC_PATHS = ["/conta/entrar", "/conta/criar"];

async function hasValidSession(request: NextRequest, cookieName: string, secret: () => Uint8Array) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (await hasValidSession(request, ADMIN_COOKIE_NAME, adminSessionSecret)) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (pathname.startsWith("/conta") && !CUSTOMER_PUBLIC_PATHS.includes(pathname)) {
    if (await hasValidSession(request, CUSTOMER_COOKIE_NAME, customerSessionSecret)) return NextResponse.next();
    const url = new URL("/conta/entrar", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/conta/:path*"],
};
