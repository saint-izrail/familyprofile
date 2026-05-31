import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage, storageConfigured } from "@/lib/storage";

const MAX = 8 * 1024 * 1024; // 8MB

// Upload foto MANDIRI (publik) -> masuk antrian (approved=false), perlu disetujui admin.
export async function POST(req: Request) {
  if (!storageConfigured()) {
    return NextResponse.json({ ok: false, message: "Fitur upload belum tersedia." }, { status: 400 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const memberId = typeof form?.get("memberId") === "string" ? String(form.get("memberId")) : "";
  const caption = typeof form?.get("caption") === "string" ? String(form.get("caption")).trim() : "";
  const submittedBy = typeof form?.get("submittedBy") === "string" ? String(form.get("submittedBy")).trim() : "";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, message: "File tidak ditemukan." }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ ok: false, message: "Ukuran foto maksimal 8MB." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, message: "File harus berupa gambar." }, { status: 400 });
  }
  if (!memberId) {
    return NextResponse.json({ ok: false, message: "Pilih anggota tujuan foto." }, { status: 422 });
  }
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } });
  if (!member) {
    return NextResponse.json({ ok: false, message: "Anggota tidak ditemukan." }, { status: 404 });
  }
  try {
    const url = await uploadImage(file, "requests");
    await prisma.photo.create({
      data: { memberId, url, caption: caption || null, submittedBy: submittedBy || null, approved: false },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
