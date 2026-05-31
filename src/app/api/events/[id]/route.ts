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
  const data: Prisma.EventUncheckedUpdateInput = {};
  if ("title" in b) {
    const t = str(b.title);
    if (!t) return NextResponse.json({ ok: false, message: "Judul tidak boleh kosong." }, { status: 422 });
    data.title = t;
  }
  if ("date" in b) {
    const d = new Date(String(b.date));
    if (Number.isNaN(d.getTime())) return NextResponse.json({ ok: false, message: "Tanggal tidak valid." }, { status: 422 });
    data.date = d;
  }
  if ("type" in b) data.type = str(b.type) ?? "acara";
  if ("recurring" in b) data.recurring = !!b.recurring;
  if ("description" in b) data.description = str(b.description);
  if ("memberId" in b) data.memberId = str(b.memberId);

  try {
    await prisma.event.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Momen tidak ditemukan." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Momen tidak ditemukan." }, { status: 404 });
  }
}
