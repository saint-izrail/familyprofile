import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { revalidatePublic } from "@/lib/revalidate";

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

// Apakah menjadikan newParentId sebagai induk dari childId akan membuat siklus
// (mis. memindahkan node ke bawah keturunannya sendiri)?
async function wouldCycle(
  tx: Prisma.TransactionClient,
  childId: string,
  newParentId: string,
): Promise<boolean> {
  let cur: string | null = newParentId;
  let guard = 0;
  while (cur && guard++ < 200) {
    if (cur === childId) return true;
    const p: { parentId: string | null } | null = await tx.member.findUnique({
      where: { id: cur },
      select: { parentId: true },
    });
    cur = p?.parentId ?? null;
  }
  return false;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const b = await req.json().catch(() => ({}));

  const current = await prisma.member.findUnique({
    where: { id },
    select: { id: true, name: true, marriedIn: true, partnerId: true, parentId: true },
  });
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

  // Validasi perpindahan induk (ada + tak memicu siklus) sebelum menulis.
  if ("parentId" in b) {
    const newParentId = typeof data.parentId === "string" ? data.parentId : null;
    if (newParentId) {
      const parent = await prisma.member.findUnique({ where: { id: newParentId }, select: { id: true } });
      if (!parent) return NextResponse.json({ ok: false, message: "Induk tidak ditemukan." }, { status: 422 });
      if (await wouldCycle(prisma, id, newParentId)) {
        return NextResponse.json({ ok: false, message: "Tidak bisa: induk membentuk lingkaran." }, { status: 409 });
      }
    }
  }

  try {
    // Semua tulisan (anggota + sinkronisasi pasangan) dalam satu transaksi:
    // gagal di tengah akan rollback, bukan meninggalkan data tak konsisten.
    const member = await prisma.$transaction(async (tx) => {
      const updated = await tx.member.update({ where: { id }, data });

      if (current.marriedIn) {
        // Menyunting pasangan: sinkronkan denormalisasi di anggota keturunan.
        if (current.partnerId) {
          const sync: Prisma.MemberUncheckedUpdateInput = {};
          if ("name" in b && typeof data.name === "string") sync.spouseName = data.name;
          if ("isDeceased" in b) sync.spouseDeceased = !!b.isDeceased;
          if (Object.keys(sync).length) await tx.member.update({ where: { id: current.partnerId }, data: sync });
        }
      } else {
        // Anggota keturunan: kelola pasangan dari sisi ini.
        if ("spouseName" in b) {
          const spouseName = str(b.spouseName);
          if (spouseName) {
            if (current.partnerId) {
              await tx.member.update({ where: { id: current.partnerId }, data: { name: spouseName, spouseName: updated.name, isDeceased: !!b.spouseDeceased } });
            } else {
              const spouse = await tx.member.create({ data: { name: spouseName, spouseName: updated.name, marriedIn: true, partnerId: id, isDeceased: !!b.spouseDeceased } });
              await tx.member.update({ where: { id }, data: { partnerId: spouse.id } });
            }
          } else if (current.partnerId) {
            await tx.member.update({ where: { id }, data: { partnerId: null } });
            await tx.member.delete({ where: { id: current.partnerId } });
          }
        }
        // Cerminkan status almarhum ke pasangan (spouseDeceased).
        if ("isDeceased" in b && current.partnerId) {
          await tx.member.update({ where: { id: current.partnerId }, data: { spouseDeceased: !!b.isDeceased } });
        }
      }
      return updated;
    });

    revalidatePublic();
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
      await prisma.$transaction(async (tx) => {
        if (me.partnerId) {
          await tx.member.update({ where: { id: me.partnerId }, data: { spouseName: null, spouseDeceased: false } });
        }
        await tx.member.delete({ where: { id } });
      });
      revalidatePublic();
      return NextResponse.json({ ok: true });
    }

    // Menghapus anggota KETURUNAN: blokir bila masih punya anak, lalu hapus
    // beserta pasangannya dalam satu transaksi (invarian tetap terjaga).
    await prisma.$transaction(async (tx) => {
      const childCount = await tx.member.count({ where: { parentId: id } });
      if (childCount > 0) {
        throw Object.assign(new Error(`Tidak bisa dihapus: masih punya ${childCount} anak. Pindahkan/hapus anak dulu.`), { code: "HAS_CHILDREN" });
      }
      await tx.member.delete({ where: { id } }); // partnerId pasangan -> null (onDelete SetNull)
      if (me.partnerId) await tx.member.delete({ where: { id: me.partnerId } });
    });

    revalidatePublic();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === "HAS_CHILDREN") return NextResponse.json({ ok: false, message: err.message }, { status: 409 });
    if (err.code === "P2025") return NextResponse.json({ ok: false, message: "Anggota tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
