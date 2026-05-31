// Pembatas laju best-effort di memori (per-instance serverless). Bukan jaminan
// kuat lintas-instance, tetapi cukup meredam brute-force/spam dari satu IP.
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// IP klien dari header proxy (Vercel mengisi x-forwarded-for).
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

// Kembalikan true bila key DIBLOKIR (melebihi kuota pada jendela waktu).
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Bersihkan sesekali agar map tak tumbuh tanpa batas.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > limit;
}

// Tolak bila header Origin ADA tapi bukan host permintaan (postur anti-CSRF
// eksplisit). Permintaan tanpa Origin (same-origin/non-browser) diizinkan.
export function badOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const host = req.headers.get("host");
    return !!host && new URL(origin).host !== host;
  } catch {
    return true;
  }
}
