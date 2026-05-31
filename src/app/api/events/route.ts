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
  const title = str(b?.title);
  const dateStr = str(b?.date);
  if (!title || !dateStr) {
    return NextResponse.json({ ok: false, message: "Judul & tanggal wajib diisi." }, { status: 422 });
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ ok: false, message: "Tanggal tidak valid." }, { status: 422 });
  }
  try {
    const event = await prisma.event.create({
      data: {
        title,
        date,
        type: str(b?.type) ?? "acara",
        recurring: !!b?.recurring,
        description: str(b?.description),
        memberId: str(b?.memberId),
      },
    });
    return NextResponse.json({ ok: true, event: { id: event.id } });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
