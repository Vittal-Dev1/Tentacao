// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "tentacao_admin_auth";
const PROTECTED_ROUTES = ["/admin", "/api/upload"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Se a rota não é protegida, só segue
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  // Lê o cookie de sessão
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Se tiver cookie ok, deixa passar
  if (token === "ok") {
    return NextResponse.next();
  }

  // Se NÃO tiver cookie, manda pro /login
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

// Define em quais rotas o middleware roda
export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/upload"],
};
