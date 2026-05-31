// Akses agenda / momen penting. Menghitung kemunculan berikutnya untuk yang
// berulang (ulang tahun) dan sisa hari menuju momen.
import { prisma } from "@/lib/prisma";

export type EventItem = {
  id: string;
  title: string;
  type: string; // "ulang-tahun" | "acara" | "rencana"
  recurring: boolean;
  description: string | null;
  memberId: string | null;
  memberName: string | null;
  date: string; // ISO tanggal asli
  nextDate: string; // ISO kemunculan berikutnya
  daysUntil: number;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextOccurrence(date: Date, recurring: boolean, today: Date): Date {
  if (!recurring) return date;
  const n = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (n.getTime() < today.getTime()) n.setFullYear(today.getFullYear() + 1);
  return n;
}

function toItem(e: { id: string; title: string; type: string; recurring: boolean; description: string | null; memberId: string | null; date: Date; member: { name: string } | null }, today: Date): EventItem {
  const d = new Date(e.date);
  const nd = nextOccurrence(d, e.recurring, today);
  return {
    id: e.id,
    title: e.title,
    type: e.type,
    recurring: e.recurring,
    description: e.description,
    memberId: e.memberId,
    memberName: e.member?.name ?? null,
    date: d.toISOString(),
    nextDate: nd.toISOString(),
    daysUntil: Math.round((nd.getTime() - today.getTime()) / 86400000),
  };
}

// Momen mendatang (sisa hari >= 0), terurut dari yang terdekat.
export async function getUpcomingEvents(limit?: number): Promise<EventItem[]> {
  const rows = await prisma.event.findMany({ include: { member: { select: { name: true } } } });
  const today = startOfToday();
  const upcoming = rows
    .map((e) => toItem(e, today))
    .filter((i) => i.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);
  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
}

// Semua momen (untuk admin), terurut tanggal.
export async function getAllEvents(): Promise<EventItem[]> {
  const rows = await prisma.event.findMany({ orderBy: { date: "asc" }, include: { member: { select: { name: true } } } });
  const today = startOfToday();
  return rows.map((e) => toItem(e, today));
}
