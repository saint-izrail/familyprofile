import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Setujui usulan: terapkan perubahan sesuai jenis, lalu hapus dari antrian.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const sub = await prisma.submission.findUnique({ where: { id } });
  if (!sub) return NextResponse.json({ ok: false, message: "Usulan tidak ditemukan." }, { status: 404 });

  try {
    if (sub.kind === "galeri" && sub.memberId && sub.imageUrl) {
      const count = await prisma.photo.count({ where: { memberId: sub.memberId } });
      await prisma.photo.create({ data: { memberId: sub.memberId, url: sub.imageUrl, caption: sub.caption, order: count, approved: true } });
    } else if (sub.kind === "foto-profil" && sub.memberId && sub.imageUrl) {
      await prisma.member.update({ where: { id: sub.memberId }, data: { avatarUrl: sub.imageUrl } });
    } else if (sub.kind === "foto-keluarga" && sub.memberId && sub.imageUrl) {
      await prisma.member.update({ where: { id: sub.memberId }, data: { familyPhotoUrl: sub.imageUrl } });
    } else if (sub.kind === "bio" && sub.memberId && sub.bio) {
      await prisma.member.update({ where: { id: sub.memberId }, data: { bio: sub.bio } });
    } else if (sub.kind === "agenda" && sub.title && sub.date) {
      await prisma.event.create({
        data: { title: sub.title, date: sub.date, type: sub.type ?? "acara", recurring: sub.recurring, description: sub.description, memberId: sub.memberId },
      });
    } else {
      return NextResponse.json({ ok: false, message: "Usulan tidak lengkap." }, { status: 422 });
    }
    await prisma.submission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}

// Tolak usulan: hapus dari antrian.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.submission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Usulan tidak ditemukan." }, { status: 404 });
  }
}
