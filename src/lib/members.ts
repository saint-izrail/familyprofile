// Akses data anggota (server-only). Mengembalikan objek polos & serializable
// agar aman dilempar ke Client Component.
import { prisma } from "@/lib/prisma";
import type { MemberNode, MemberFull } from "@/lib/types";

// Bentuk ringan untuk node pohon/daftar.
export type TreeMember = {
  id: string;
  number: string | null;
  name: string;
  spouseName: string | null;
  isDeceased: boolean;
  spouseDeceased: boolean;
  avatarUrl: string | null;
  children: TreeMember[];
};

function buildTree(
  rows: {
    id: string;
    number: string | null;
    name: string;
    spouseName: string | null;
    isDeceased: boolean;
    spouseDeceased: boolean;
    avatarUrl: string | null;
    parentId: string | null;
  }[],
): TreeMember[] {
  const map = new Map<string, TreeMember>();
  for (const r of rows) {
    map.set(r.id, {
      id: r.id,
      number: r.number,
      name: r.name,
      spouseName: r.spouseName,
      isDeceased: r.isDeceased,
      spouseDeceased: r.spouseDeceased,
      avatarUrl: r.avatarUrl,
      children: [],
    });
  }
  const roots: TreeMember[] = [];
  for (const r of rows) {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) map.get(r.parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}

// Seluruh pohon (akar = anggota tanpa parent).
export async function getTree(): Promise<TreeMember[]> {
  const rows = await prisma.member.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      number: true,
      name: true,
      spouseName: true,
      isDeceased: true,
      spouseDeceased: true,
      avatarUrl: true,
      parentId: true,
    },
  });
  return buildTree(rows);
}

export async function countMembers(): Promise<number> {
  return prisma.member.count();
}

// Anggota lengkap untuk halaman profil.
export async function getMemberFull(id: string): Promise<MemberFull | null> {
  const m = await prisma.member.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { order: "asc" } },
      parent: { select: { id: true, name: true, spouseName: true, number: true } },
      children: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true, spouseName: true, number: true, avatarUrl: true, isDeceased: true },
      },
    },
  });
  if (!m) return null;
  return {
    id: m.id,
    number: m.number,
    name: m.name,
    spouseName: m.spouseName,
    isDeceased: m.isDeceased,
    spouseDeceased: m.spouseDeceased,
    gender: m.gender,
    bio: m.bio,
    birthInfo: m.birthInfo,
    order: m.order,
    parentId: m.parentId,
    avatarUrl: m.avatarUrl,
    familyPhotoUrl: m.familyPhotoUrl,
    photos: m.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption, order: p.order })),
    parent: m.parent,
    children: m.children,
  };
}

// Daftar datar (untuk admin & pencarian).
export async function getAllFlat() {
  return prisma.member.findMany({
    orderBy: [{ number: "asc" }, { order: "asc" }],
    select: { id: true, number: true, name: true, spouseName: true, parentId: true, isDeceased: true },
  });
}

// Anggota akar (untuk hero beranda).
export async function getRoot() {
  return prisma.member.findFirst({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });
}

export type AdminMember = {
  id: string;
  number: string | null;
  name: string;
  spouseName: string | null;
  isDeceased: boolean;
  spouseDeceased: boolean;
  bio: string | null;
  birthInfo: string | null;
  order: number;
  parentId: string | null;
  avatarUrl: string | null;
  familyPhotoUrl: string | null;
  photos: { id: string; url: string; caption: string | null; order: number }[];
};

// Semua anggota + foto (untuk dasbor admin). Objek polos & serializable.
export async function getAllForAdmin(): Promise<AdminMember[]> {
  const rows = await prisma.member.findMany({
    orderBy: [{ number: "asc" }, { order: "asc" }],
    include: { photos: { orderBy: { order: "asc" } } },
  });
  return rows.map((m) => ({
    id: m.id,
    number: m.number,
    name: m.name,
    spouseName: m.spouseName,
    isDeceased: m.isDeceased,
    spouseDeceased: m.spouseDeceased,
    bio: m.bio,
    birthInfo: m.birthInfo,
    order: m.order,
    parentId: m.parentId,
    avatarUrl: m.avatarUrl,
    familyPhotoUrl: m.familyPhotoUrl,
    photos: m.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption, order: p.order })),
  }));
}

export type Crumb = { id: string; name: string; spouseName: string | null; number: string | null };

// Jalur leluhur dari akar -> anggota (untuk breadcrumb).
export async function getAncestry(id: string): Promise<Crumb[]> {
  const all = await prisma.member.findMany({
    select: { id: true, name: true, spouseName: true, number: true, parentId: true },
  });
  const map = new Map(all.map((m) => [m.id, m]));
  const path: Crumb[] = [];
  let cur = map.get(id);
  let guard = 0;
  while (cur && guard++ < 50) {
    path.unshift({ id: cur.id, name: cur.name, spouseName: cur.spouseName, number: cur.number });
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return path;
}

export type SiblingMember = {
  id: string;
  name: string;
  spouseName: string | null;
  number: string | null;
  avatarUrl: string | null;
  isDeceased: boolean;
};

export async function getSiblings(id: string, parentId: string | null): Promise<SiblingMember[]> {
  if (!parentId) return [];
  return prisma.member.findMany({
    where: { parentId, NOT: { id } },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, spouseName: true, number: true, avatarUrl: true, isDeceased: true },
  });
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

export async function getStats(): Promise<Stats> {
  const tree = await getTree();
  const root = tree[0] ?? null;
  let total = 0;
  let deceased = 0;
  let couples = 0;
  let maxDepth = 0;
  const walk = (n: TreeMember, d: number) => {
    total++;
    if (n.isDeceased) deceased++;
    if (n.spouseName) couples++;
    maxDepth = Math.max(maxDepth, d);
    for (const c of n.children) walk(c, d + 1);
  };
  for (const r of tree) walk(r, 0);
  const families: FamilyStat[] = (root?.children ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    spouseName: c.spouseName,
    count: countNodes([c]),
  }));
  return { total, deceased, couples, generations: maxDepth + 1, families, rootName: root?.name ?? null };
}

function countNodes(nodes: TreeMember[]): number {
  return nodes.reduce((n, x) => n + 1 + countNodes(x.children), 0);
}

// Daftar datar untuk pencarian & kalkulator hubungan (id, nama, parent).
export type FlatMember = {
  id: string;
  number: string | null;
  name: string;
  spouseName: string | null;
  parentId: string | null;
};

export async function getFlatMembers(): Promise<FlatMember[]> {
  return prisma.member.findMany({
    orderBy: [{ number: "asc" }, { order: "asc" }],
    select: { id: true, number: true, name: true, spouseName: true, parentId: true },
  });
}

export type { MemberNode };
