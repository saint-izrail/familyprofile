import { NextResponse } from "next/server";
import { checkPassword, adminToken, ADMIN_COOKIE, SESSION_TTL_MS } from "@/lib/auth";
import { rateLimited, clientIp, badOrigin } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Tolak lintas-origin (anti-CSRF) lalu batasi percobaan (anti brute-force).
  if (badOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Origin tidak sah." }, { status: 403 });
  }
  if (rateLimited(`login:${clientIp(req)}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, message: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";
  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, message: "Password salah." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return res;
}
