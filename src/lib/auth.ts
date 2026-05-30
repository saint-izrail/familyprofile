// Otentikasi admin sederhana berbasis password (.env) + cookie HMAC.
// Hanya dipakai di sisi server (route handler / server component).
import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_COOKIE = "bae_admin";

// Token sesi = HMAC(secret, konstan). Stateless, cocok untuk serverless.
export function adminToken(): string {
  const secret =
    process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "dev-secret-change-me";
  return crypto.createHmac("sha256", secret).update("bae-admin-session-v1").digest("hex");
}

// Bandingkan password input dengan ADMIN_PASSWORD (waktu-konstan).
export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Apakah request saat ini admin yang sah?
export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  const v = c.get(ADMIN_COOKIE)?.value;
  return !!v && v === adminToken();
}
