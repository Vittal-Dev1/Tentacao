// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  checkAdminPassword,
  SESSION_COOKIE_NAME,
} from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const password = body?.password as string | undefined;
  const redirectTo = (body?.redirectTo as string | undefined) || "/admin";

  if (!password) {
    return NextResponse.json(
      { message: "Senha não informada." },
      { status: 400 }
    );
  }

  try {
    const valid = checkAdminPassword(password);
    if (!valid) {
      return NextResponse.json(
        { message: "Senha inválida." },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro de configuração no servidor." },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true, redirectTo });

  res.cookies.set(SESSION_COOKIE_NAME, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });

  return res;
}
