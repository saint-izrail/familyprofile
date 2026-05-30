// Klien Supabase (server) untuk upload foto ke Storage.
// Memakai service-role key — HANYA dipakai di server (route handler).
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const BUCKET = process.env.SUPABASE_BUCKET || "foto";

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

// Upload sebuah File ke bucket, kembalikan URL publik.
export async function uploadImage(file: File, folder = "members"): Promise<string> {
  const supabase = getSupabaseAdmin();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safe = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(safe, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(`Gagal upload: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(safe);
  return data.publicUrl;
}
