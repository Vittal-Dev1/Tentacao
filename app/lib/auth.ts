// lib/auth.ts
import { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "tentacao_admin_auth";

export function isRequestAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  return cookie?.value === "ok";
}

export function checkAdminPassword(password: string): boolean {
  const adminPassword = "tentacao123";
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD não configurada no .env");
  }
  return password === adminPassword;
}
