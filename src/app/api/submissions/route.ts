import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage, storageConfigured } from "@/lib/storage";

const PHOTO_KINDS = ["galeri", "foto-profil", "foto-keluarga"];
const MAX = 8 * 1024 * 1024;
const s = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const bad = (message: string, status = 422) => NextResponse.json({ ok: false, message }, { status });

// Usulan PUBLIK -> masuk antrian (perlu approval admin). Multipart untuk jenis
// foto; JSON untuk bio/agenda.
export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    const kind = String(form?.get("kind") || "");
    const file = form?.get("file");
    const memberId = s(form?.get("memberId"));
    if (!PHOTO_KINDS.includes(kind)) return bad("Jenis usulan tidak valid.");
    if (!storageConfigured()) return bad("Fitur upload belum tersedia.", 400);
    if (!(file instanceof File) || file.size === 0) return bad("File tidak ditemukan.", 400);
    if (file.size > MAX) return bad("Ukuran foto maksimal 8MB.", 400);
    if (!file.type.startsWith("image/")) return bad("File harus berupa gambar.", 400);
    if (!memberId) return bad("Pilih anggota tujuan.");
    const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } });
    if (!member) return bad("Anggota tidak ditemukan.", 404);
    try {
      const url = await uploadImage(file, "submissions");
      await prisma.submission.create({
        data: { kind, memberId, imageUrl: url, caption: s(form?.get("caption")), submittedBy: s(form?.get("submittedBy")) },
      });
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
    }
  }

  const b = await req.json().catch(() => ({}));
  const kind = String(b?.kind || "");
  const submittedBy = s(b?.submittedBy);

  if (kind === "bio") {
    const memberId = s(b?.memberId);
    const bio = s(b?.bio);
    if (!memberId) return bad("Pilih anggota.");
    if (!bio) return bad("Bio tidak boleh kosong.");
    const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } });
    if (!member) return bad("Anggota tidak ditemukan.", 404);
    await prisma.submission.create({ data: { kind, memberId, bio, submittedBy } });
    return NextResponse.json({ ok: true });
  }

  if (kind === "agenda") {
    const title = s(b?.title);
    const dateStr = s(b?.date);
    if (!title || !dateStr) return bad("Judul & tanggal wajib diisi.");
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return bad("Tanggal tidak valid.");
    await prisma.submission.create({
      data: { kind, title, date, type: s(b?.type) ?? "acara", recurring: !!b?.recurring, description: s(b?.description), memberId: s(b?.memberId), submittedBy },
    });
    return NextResponse.json({ ok: true });
  }

  return bad("Jenis usulan tidak valid.");
}
