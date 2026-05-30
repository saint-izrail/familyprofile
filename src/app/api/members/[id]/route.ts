import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const b = await req.json().catch(() => ({}));

  const current = await prisma.member.findUnique({ where: { id }, select: { id: true, name: true, marriedIn: true, partnerId: true } });
  if (!current) return NextResponse.json({ ok: false, message: "Anggota tidak ditemukan." }, { status: 404 });

  const data: Prisma.MemberUncheckedUpdateInput = {};
  if ("name" in b) {
    const name = str(b.name);
    if (!name) return NextResponse.json({ ok: false, message: "Nama tidak boleh kosong." }, { status: 422 });
    data.name = name;
  }
  if ("spouseName" in b) data.spouseName = str(b.spouseName);
  if ("number" in b) data.number = str(b.number);
  if ("parentId" in b) data.parentId = b.parentId === id ? null : str(b.parentId);
  if ("isDeceased" in b) data.isDeceased = !!b.isDeceased;
  if ("spouseDeceased" in b) data.spouseDeceased = !!b.spouseDeceased;
  if ("gender" in b) data.gender = str(b.gender);
  if ("bio" in b) data.bio = str(b.bio);
  if ("birthInfo" in b) data.birthInfo = str(b.birthInfo);
  if ("avatarUrl" in b) data.avatarUrl = str(b.avatarUrl);
  if ("familyPhotoUrl" in b) data.familyPhotoUrl = str(b.familyPhotoUrl);
  if ("order" in b && Number.isFinite(b.order)) data.order = Number(b.order);

  try {
    const member = await prisma.member.update({ where: { id }, data });

    if (current.marriedIn) {
      // Menyunting pasangan: sinkronkan denormalisasi di anggota keturunan.
      if (current.partnerId) {
        const sync: Prisma.MemberUncheckedUpdateInput = {};
        if ("name" in b && typeof data.name === "string") sync.spouseName = data.name;
        if ("isDeceased" in b) sync.spouseDeceased = !!b.isDeceased;
        if (Object.keys(sync).length) await prisma.member.update({ where: { id: current.partnerId }, data: sync }).catch(() => {});
      }
    } else {
      // Anggota keturunan: kelola pasangan dari sisi ini.
      if ("spouseName" in b) {
        const spouseName = str(b.spouseName);
        if (spouseName) {
          if (current.partnerId) {
            await prisma.member.update({ where: { id: current.partnerId }, data: { name: spouseName, spouseName: member.name, isDeceased: !!b.spouseDeceased } });
          } else {
            const spouse = await prisma.member.create({ data: { name: spouseName, spouseName: member.name, marriedIn: true, partnerId: id, isDeceased: !!b.spouseDeceased } });
            await prisma.member.update({ where: { id }, data: { partnerId: spouse.id } });
          }
        } else if (current.partnerId) {
          await prisma.member.update({ where: { id }, data: { partnerId: null } });
          await prisma.member.delete({ where: { id: current.partnerId } }).catch(() => {});
        }
      }
      // Cerminkan status almarhum ke pasangan (spouseDeceased).
      if ("isDeceased" in b && current.partnerId) {
        await prisma.member.update({ where: { id: current.partnerId }, data: { spouseDeceased: !!b.isDeceased } }).catch(() => {});
      }
    }
    return NextResponse.json({ ok: true, member });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === "P2025") return NextResponse.json({ ok: false, message: "Anggota tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const me = await prisma.member.findUnique({ where: { id }, select: { marriedIn: true, partnerId: true } });
  if (!me) return NextResponse.json({ ok: false, message: "Anggota tidak ditemukan." }, { status: 404 });

  try {
    if (me.marriedIn) {
      // Menghapus PASANGAN: lepaskan tautan di anggota keturunan, jangan hapus dia.
      if (me.partnerId) {
        await prisma.member.update({ where: { id: me.partnerId }, data: { spouseName: null, spouseDeceased: false } }).catch(() => {});
      }
      await prisma.member.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    // Menghapus anggota KETURUNAN: blokir bila masih punya anak.
    const childCount = await prisma.member.count({ where: { parentId: id } });
    if (childCount > 0) {
      return NextResponse.json(
        { ok: false, message: `Tidak bisa dihapus: masih punya ${childCount} anak. Pindahkan/hapus anak dulu.` },
        { status: 409 },
      );
    }
    await prisma.member.delete({ where: { id } }); // partnerId pasangan -> null (onDelete SetNull)
    if (me.partnerId) await prisma.member.delete({ where: { id: me.partnerId } }).catch(() => {}); // hapus pasangannya juga
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === "P2025") return NextResponse.json({ ok: false, message: "Anggota tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
