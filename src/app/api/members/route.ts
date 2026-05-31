import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePublic } from "@/lib/revalidate";

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  const b = await req.json().catch(() => ({}));
  const name = str(b?.name);
  if (!name) {
    return NextResponse.json({ ok: false, message: "Nama wajib diisi." }, { status: 422 });
  }
  const spouseName = str(b?.spouseName);
  const parentId = str(b?.parentId);

  try {
    // Cegah subtree lepas: induk yang ditunjuk harus ada.
    if (parentId) {
      const parent = await prisma.member.findUnique({ where: { id: parentId }, select: { id: true } });
      if (!parent) {
        return NextResponse.json({ ok: false, message: "Induk tidak ditemukan." }, { status: 422 });
      }
    }

    // Buat anggota keturunan + pasangan + saling-tautan secara atomik.
    const member = await prisma.$transaction(async (tx) => {
      const m = await tx.member.create({
        data: {
          name,
          spouseName,
          number: str(b?.number),
          parentId,
          isDeceased: !!b?.isDeceased,
          spouseDeceased: !!b?.spouseDeceased,
          gender: str(b?.gender),
          bio: str(b?.bio),
          birthInfo: str(b?.birthInfo),
          avatarUrl: str(b?.avatarUrl),
          familyPhotoUrl: str(b?.familyPhotoUrl),
          order: Number.isFinite(b?.order) ? Number(b.order) : 0,
          marriedIn: false,
        },
      });
      if (spouseName) {
        const spouse = await tx.member.create({
          data: { name: spouseName, spouseName: name, marriedIn: true, partnerId: m.id, isDeceased: !!b?.spouseDeceased },
        });
        await tx.member.update({ where: { id: m.id }, data: { partnerId: spouse.id } });
      }
      return m;
    });

    revalidatePublic();
    return NextResponse.json({ ok: true, member });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
