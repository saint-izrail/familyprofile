import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { uploadImage, storageConfigured } from "@/lib/storage";

// Upload satu gambar (multipart) -> kembalikan URL publik. Admin saja.
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  if (!storageConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Supabase Storage belum dikonfigurasi (SUPABASE_URL / SERVICE_ROLE_KEY)." },
      { status: 400 },
    );
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, message: "File tidak ditemukan." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, message: "Ukuran foto maksimal 8MB." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, message: "File harus berupa gambar." }, { status: 400 });
  }
  try {
    const folder = (form?.get("folder") as string) || "members";
    const url = await uploadImage(file, folder);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
