// Antrian usulan publik yang menunggu persetujuan admin.
import { prisma } from "@/lib/prisma";

export type SubmissionItem = {
  id: string;
  kind: string; // galeri | foto-profil | foto-keluarga | bio | agenda
  memberId: string | null;
  memberName: string | null;
  imageUrl: string | null;
  caption: string | null;
  bio: string | null;
  title: string | null;
  date: string | null;
  type: string | null;
  recurring: boolean;
  description: string | null;
  submittedBy: string | null;
  createdAt: string;
};

export async function getSubmissions(): Promise<SubmissionItem[]> {
  const rows = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: { member: { select: { name: true } } },
  });
  return rows.map((s) => ({
    id: s.id,
    kind: s.kind,
    memberId: s.memberId,
    memberName: s.member?.name ?? null,
    imageUrl: s.imageUrl,
    caption: s.caption,
    bio: s.bio,
    title: s.title,
    date: s.date ? s.date.toISOString() : null,
    type: s.type,
    recurring: s.recurring,
    description: s.description,
    submittedBy: s.submittedBy,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function countSubmissions(): Promise<number> {
  return prisma.submission.count();
}
