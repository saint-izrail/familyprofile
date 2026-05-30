import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Tambah foto galeri ke anggota. Admin saja.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  const url = typeof b?.url === "string" ? b.url.trim() : "";
  if (!url) return NextResponse.json({ ok: false, message: "URL foto wajib." }, { status: 422 });

  const count = await prisma.photo.count({ where: { memberId: id } });
  const photo = await prisma.photo.create({
    data: {
      memberId: id,
      url,
      caption: typeof b?.caption === "string" && b.caption.trim() ? b.caption.trim() : null,
      order: count,
    },
  });
  return NextResponse.json({ ok: true, photo });
}
