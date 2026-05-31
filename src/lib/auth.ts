// Otentikasi admin sederhana berbasis password (.env) + cookie HMAC bertanda
// kedaluwarsa. Hanya dipakai di sisi server (route handler / server component).
import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_COOKIE = "bae_admin";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari

function secret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "dev-secret-change-me";
}

function sign(exp: number): string {
  return crypto.createHmac("sha256", secret()).update(`bae-admin-v2.${exp}`).digest("hex");
}

// Token sesi = "<exp>.<hmac>". Kedaluwarsa membatasi dampak cookie yang bocor
// (tetap stateless, cocok untuk serverless).
export function adminToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  return `${exp}.${sign(exp)}`;
}

function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function tokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = Number(token.slice(0, dot));
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return safeEqualHex(token.slice(dot + 1), sign(exp));
}

// Bandingkan password input dengan ADMIN_PASSWORD secara waktu-konstan TANPA
// membocorkan panjang (bandingkan digest SHA-256 yang selalu 32 byte).
export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw) return false;
  const h = (s: string) => crypto.createHash("sha256").update(s).digest();
  return crypto.timingSafeEqual(h(input), h(pw));
}

// Apakah permintaan saat ini admin yang sah (token valid & belum kedaluwarsa)?
export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return tokenValid(c.get(ADMIN_COOKIE)?.value);
}
