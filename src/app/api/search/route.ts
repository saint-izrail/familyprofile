import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pencarian anggota publik (untuk command palette / search). GET ?q=
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return NextResponse.json({ results: [] });
  try {
    const rows = await prisma.member.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { spouseName: { contains: q, mode: "insensitive" } },
          { number: { contains: q } },
        ],
      },
      take: 12,
      orderBy: [{ number: "asc" }],
      select: { id: true, number: true, name: true, spouseName: true, avatarUrl: true },
    });
    return NextResponse.json({ results: rows });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
