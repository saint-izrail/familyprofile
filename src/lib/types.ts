// Tipe bersama untuk data anggota & foto.
export type Member = {
  id: string;
  number: string | null;
  name: string;
  spouseName: string | null;
  isDeceased: boolean;
  spouseDeceased: boolean;
  gender: string | null;
  bio: string | null;
  birthInfo: string | null;
  order: number;
  parentId: string | null;
  avatarUrl: string | null;
  familyPhotoUrl: string | null;
};

export type Photo = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};

// Node pohon (anggota + anak-anaknya, rekursif).
export type MemberNode = Member & { children: MemberNode[] };

// Anggota lengkap untuk halaman profil.
export type MemberFull = Member & {
  photos: Photo[];
  parent: Pick<Member, "id" | "name" | "spouseName" | "number"> | null;
  children: Pick<Member, "id" | "name" | "spouseName" | "number" | "avatarUrl" | "isDeceased">[];
};
