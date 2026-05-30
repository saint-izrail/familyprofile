import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  try {
    const member = await prisma.member.create({
      data: {
        name,
        spouseName: str(b?.spouseName),
        number: str(b?.number),
        parentId: str(b?.parentId),
        isDeceased: !!b?.isDeceased,
        spouseDeceased: !!b?.spouseDeceased,
        gender: str(b?.gender),
        bio: str(b?.bio),
        birthInfo: str(b?.birthInfo),
        avatarUrl: str(b?.avatarUrl),
        familyPhotoUrl: str(b?.familyPhotoUrl),
        order: Number.isFinite(b?.order) ? Number(b.order) : 0,
      },
    });
    return NextResponse.json({ ok: true, member });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
