import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePublic } from "@/lib/revalidate";

// Setujui usulan: terapkan perubahan sesuai jenis lalu hapus dari antrian —
// dalam SATU transaksi, sehingga approve ganda/berbarengan tak berlipat.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const sub = await prisma.submission.findUnique({ where: { id } });
  if (!sub) return NextResponse.json({ ok: false, message: "Usulan tidak ditemukan." }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      if (sub.kind === "galeri" && sub.memberId && sub.imageUrl) {
        // Urutan dari max(order) (atomik di dalam transaksi), bukan count().
        const last = await tx.photo.aggregate({ where: { memberId: sub.memberId }, _max: { order: true } });
        const order = (last._max.order ?? -1) + 1;
        await tx.photo.create({ data: { memberId: sub.memberId, url: sub.imageUrl, caption: sub.caption, order, approved: true } });
      } else if (sub.kind === "foto-profil" && sub.memberId && sub.imageUrl) {
        await tx.member.update({ where: { id: sub.memberId }, data: { avatarUrl: sub.imageUrl } });
      } else if (sub.kind === "foto-keluarga" && sub.memberId && sub.imageUrl) {
        await tx.member.update({ where: { id: sub.memberId }, data: { familyPhotoUrl: sub.imageUrl } });
      } else if (sub.kind === "bio" && sub.memberId && sub.bio) {
        await tx.member.update({ where: { id: sub.memberId }, data: { bio: sub.bio } });
      } else if (sub.kind === "agenda" && sub.title && sub.date) {
        await tx.event.create({
          data: { title: sub.title, date: sub.date, type: sub.type ?? "acara", recurring: sub.recurring, description: sub.description, memberId: sub.memberId },
        });
      } else {
        throw Object.assign(new Error("Usulan tidak lengkap."), { code: "INCOMPLETE" });
      }
      // Hapus terakhir: bila sudah dihapus (approve berbarengan) -> P2025 -> rollback.
      await tx.submission.delete({ where: { id } });
    });

    revalidatePublic();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === "INCOMPLETE") return NextResponse.json({ ok: false, message: err.message }, { status: 422 });
    if (err.code === "P2025") return NextResponse.json({ ok: false, message: "Usulan sudah diproses." }, { status: 409 });
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
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
