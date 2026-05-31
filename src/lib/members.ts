// Akses data anggota (server-only). Mengembalikan objek polos & serializable.
// Model: setiap pasangan = dua anggota nyata yang saling tertaut (partnerId).
// Garis keturunan = anggota dengan marriedIn=false. Pasangan (marriedIn=true)
// menempel pada anggota keturunan, dan anak bergantung pada anggota keturunan.
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { MemberFull, PartnerLite } from "@/lib/types";

export type TreeMember = {
  id: string;
  number: string | null;
  name: string;
  isDeceased: boolean;
  avatarUrl: string | null;
  partner: { id: string; name: string; isDeceased: boolean; avatarUrl: string | null } | null;
  children: TreeMember[];
};

type Row = {
  id: string;
  number: string | null;
  name: string;
  isDeceased: boolean;
  avatarUrl: string | null;
  parentId: string | null;
  partnerId: string | null;
  marriedIn: boolean;
};

function buildTree(rows: Row[]): TreeMember[] {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const make = (r: Row): TreeMember => {
    const p = r.partnerId ? byId.get(r.partnerId) : undefined;
    return {
      id: r.id,
      number: r.number,
      name: r.name,
      isDeceased: r.isDeceased,
      avatarUrl: r.avatarUrl,
      partner: p ? { id: p.id, name: p.name, isDeceased: p.isDeceased, avatarUrl: p.avatarUrl } : null,
      children: [],
    };
  };
  const lineage = rows.filter((r) => !r.marriedIn);
  const nodes = new Map<string, TreeMember>();
  for (const r of lineage) nodes.set(r.id, make(r));
  const roots: TreeMember[] = [];
  for (const r of lineage) {
    const n = nodes.get(r.id)!;
    if (r.parentId && nodes.has(r.parentId)) nodes.get(r.parentId)!.children.push(n);
    else roots.push(n);
  }
  return roots;
}

// Satu sumber baris anggota, di-dedupe per-request via React cache() sehingga
// getTree/getStats/countNodes pada satu render hanya menembak DB sekali.
const getMemberRows = cache(async (): Promise<Row[]> =>
  prisma.member.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      number: true,
      name: true,
      isDeceased: true,
      avatarUrl: true,
      parentId: true,
      partnerId: true,
      marriedIn: true,
    },
  }),
);

export const getTree = cache(async (): Promise<TreeMember[]> => {
  return buildTree(await getMemberRows());
});

// Profil individu. Untuk pasangan (marriedIn), keluarga berpusat di pasangannya
// (garis keturunan), sehingga "anak" diambil dari anchor tersebut.
export async function getMemberFull(id: string): Promise<MemberFull | null> {
  const m = await prisma.member.findUnique({
    where: { id },
    include: {
      photos: { where: { approved: true }, orderBy: { order: "asc" } },
      partner: {
        select: {
          id: true, name: true, number: true, isDeceased: true, avatarUrl: true, parentId: true,
          parent: { select: { id: true, name: true, number: true } },
        },
      },
      parent: { select: { id: true, name: true, number: true } },
    },
  });
  if (!m) return null;

  const anchorId = m.marriedIn && m.partnerId ? m.partnerId : m.id;
  const anchorParentId = m.marriedIn ? (m.partner?.parentId ?? null) : m.parentId;

  // Untuk pasangan (married-in), induk diambil dari sisi keturunan (partner) —
  // sudah ikut di-include di atas, jadi tak perlu query kedua.
  const parent = m.marriedIn && m.partnerId ? (m.partner?.parent ?? null) : m.parent;

  const children = await prisma.member.findMany({
    where: { parentId: anchorId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, number: true, avatarUrl: true, isDeceased: true, spouseName: true },
  });

  const partner: PartnerLite | null = m.partner
    ? { id: m.partner.id, name: m.partner.name, number: m.partner.number, isDeceased: m.partner.isDeceased, avatarUrl: m.partner.avatarUrl }
    : null;

  return {
    id: m.id,
    number: m.number,
    name: m.name,
    isDeceased: m.isDeceased,
    marriedIn: m.marriedIn,
    gender: m.gender,
    bio: m.bio,
    birthInfo: m.birthInfo,
    order: m.order,
    parentId: m.parentId,
    avatarUrl: m.avatarUrl,
    familyPhotoUrl: m.familyPhotoUrl,
    anchorId,
    anchorParentId,
    partner,
    parent,
    children,
    photos: m.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption, order: p.order })),
  };
}

// Profil keluarga: pasangan + anak. `anyId` boleh id anggota keturunan ATAU pasangannya.
export type FamilyData = {
  anchorId: string;
  number: string | null;
  familyPhotoUrl: string | null;
  bio: string | null;
  birthInfo: string | null;
  members: { id: string; name: string; isDeceased: boolean; avatarUrl: string | null; role: string; bio: string | null; birthInfo: string | null }[];
  children: { id: string; name: string; number: string | null; avatarUrl: string | null; isDeceased: boolean; spouseName: string | null; bio: string | null }[];
};

export async function getFamily(anyId: string): Promise<FamilyData | null> {
  const base = await prisma.member.findUnique({ where: { id: anyId }, select: { id: true, marriedIn: true, partnerId: true } });
  if (!base) return null;
  const anchorId = base.marriedIn && base.partnerId ? base.partnerId : base.id;
  const anchor = await prisma.member.findUnique({
    where: { id: anchorId },
    include: { partner: { select: { id: true, name: true, isDeceased: true, avatarUrl: true, bio: true, birthInfo: true, familyPhotoUrl: true } } },
  });
  if (!anchor) return null;

  const members: FamilyData["members"] = [
    { id: anchor.id, name: anchor.name, isDeceased: anchor.isDeceased, avatarUrl: anchor.avatarUrl, role: "Kepala / Keturunan", bio: anchor.bio, birthInfo: anchor.birthInfo },
  ];
  if (anchor.partner) {
    members.push({ id: anchor.partner.id, name: anchor.partner.name, isDeceased: anchor.partner.isDeceased, avatarUrl: anchor.partner.avatarUrl, role: "Pasangan", bio: anchor.partner.bio, birthInfo: anchor.partner.birthInfo });
  }

  const children = await prisma.member.findMany({
    where: { parentId: anchorId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, number: true, avatarUrl: true, isDeceased: true, spouseName: true, bio: true },
  });

  return {
    anchorId,
    number: anchor.number,
    // Foto keluarga bisa diisi dari salah satu pasangan.
    familyPhotoUrl: anchor.familyPhotoUrl ?? anchor.partner?.familyPhotoUrl ?? null,
    bio: anchor.bio,
    birthInfo: anchor.birthInfo,
    members,
    children,
  };
}

export type FamilyStat = { id: string; name: string; spouseName: string | null; count: number };
export type Stats = {
  total: number;
  deceased: number;
  couples: number;
  generations: number;
  families: FamilyStat[];
  rootName: string | null;
};

function countLineage(nodes: TreeMember[]): number {
  return nodes.reduce((n, x) => n + 1 + countLineage(x.children), 0);
}

export async function getStats(): Promise<Stats> {
  // Hitung total/almarhum/pasangan dari satu query (rows) alih-alih 3 count().
  const rows = await getMemberRows();
  const total = rows.length;
  const deceased = rows.reduce((n, r) => n + (r.isDeceased ? 1 : 0), 0);
  const couples = rows.reduce((n, r) => n + (r.marriedIn ? 1 : 0), 0);
  const tree = buildTree(rows);
  const root = tree[0] ?? null;
  let maxDepth = 0;
  const walk = (n: TreeMember, d: number) => {
    maxDepth = Math.max(maxDepth, d);
    for (const c of n.children) walk(c, d + 1);
  };
  for (const r of tree) walk(r, 0);
  const families: FamilyStat[] = (root?.children ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    spouseName: c.partner?.name ?? null,
    count: countLineage([c]),
  }));
  return { total, deceased, couples, generations: maxDepth + 1, families, rootName: root?.name ?? null };
}

// Daftar datar untuk pencarian & kalkulator hubungan.
export type FlatMember = {
  id: string;
  number: string | null;
  name: string;
  spouseName: string | null;
  parentId: string | null;
  partnerId: string | null;
  marriedIn: boolean;
};

export const getFlatMembers = cache(async (): Promise<FlatMember[]> =>
  prisma.member.findMany({
    orderBy: [{ number: "asc" }, { order: "asc" }],
    select: { id: true, number: true, name: true, spouseName: true, parentId: true, partnerId: true, marriedIn: true },
  }),
);

export type AdminMember = {
  id: string;
  number: string | null;
  name: string;
  spouseName: string | null;
  isDeceased: boolean;
  spouseDeceased: boolean;
  marriedIn: boolean;
  bio: string | null;
  birthInfo: string | null;
  order: number;
  parentId: string | null;
  partnerId: string | null;
  avatarUrl: string | null;
  familyPhotoUrl: string | null;
  photos: { id: string; url: string; caption: string | null; order: number }[];
};

export async function getAllForAdmin(): Promise<AdminMember[]> {
  const rows = await prisma.member.findMany({
    orderBy: [{ marriedIn: "asc" }, { number: "asc" }, { order: "asc" }],
    include: { photos: { orderBy: { order: "asc" } } },
  });
  return rows.map((m) => ({
    id: m.id,
    number: m.number,
    name: m.name,
    spouseName: m.spouseName,
    isDeceased: m.isDeceased,
    spouseDeceased: m.spouseDeceased,
    marriedIn: m.marriedIn,
    bio: m.bio,
    birthInfo: m.birthInfo,
    order: m.order,
    parentId: m.parentId,
    partnerId: m.partnerId,
    avatarUrl: m.avatarUrl,
    familyPhotoUrl: m.familyPhotoUrl,
    photos: m.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption, order: p.order })),
  }));
}

// Foto-foto untuk carousel beranda = galeri anggota akar (Amenan Effendi).
// Bila galeri kosong, pakai foto keluarga / avatar sebagai cadangan.
export async function getLandingPhotos(): Promise<{ url: string; caption: string | null }[]> {
  const root = await prisma.member.findFirst({
    where: { parentId: null, marriedIn: false },
    orderBy: { order: "asc" },
    include: { photos: { where: { approved: true }, orderBy: { order: "asc" } } },
  });
  if (!root) return [];
  const list = root.photos.map((p) => ({ url: p.url, caption: p.caption }));
  if (list.length === 0) {
    if (root.familyPhotoUrl) list.push({ url: root.familyPhotoUrl, caption: null });
    else if (root.avatarUrl) list.push({ url: root.avatarUrl, caption: null });
  }
  return list;
}
