// Klien Supabase (server) untuk upload foto ke Storage.
// Memakai service-role key — HANYA dipakai di server (route handler).
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const BUCKET = process.env.SUPABASE_BUCKET || "foto";

// Folder yang diizinkan sebagai prefix kunci objek (cegah path arbitrer).
const ALLOWED_FOLDERS = new Set(["members", "submissions", "events"]);

export function storageConfigured(): boolean {
  return Boolean(url && serviceKey);
}

export function getSupabaseAdmin() {
  if (!storageConfigured()) {
    throw new Error(
      "Supabase Storage belum dikonfigurasi (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Sniff magic bytes — jangan percaya content-type/ekstensi dari klien.
// Hanya izinkan raster aman (JPEG/PNG/WEBP); tolak SVG/HTML dsb.
type Sniffed = { ext: string; contentType: string };
function sniffImage(buf: Buffer): Sniffed | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { ext: "png", contentType: "image/png" };
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { ext: "webp", contentType: "image/webp" };
  }
  return null;
}

// Upload sebuah File ke bucket, kembalikan URL publik. Ekstensi & content-type
// dipaksa dari hasil sniff, folder dibatasi whitelist.
export async function uploadImage(file: File, folder = "members"): Promise<string> {
  const supabase = getSupabaseAdmin();
  const safeFolder = ALLOWED_FOLDERS.has(folder) ? folder : "members";
  const buffer = Buffer.from(await file.arrayBuffer());

  const kind = sniffImage(buffer);
  if (!kind) {
    throw new Error("Format gambar tidak didukung. Gunakan JPG, PNG, atau WEBP.");
  }

  const key = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${kind.ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(key, buffer, {
    contentType: kind.contentType,
    upsert: false,
  });
  if (error) throw new Error(`Gagal upload: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}
