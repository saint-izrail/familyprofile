// Tipe bersama.
export type Photo = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};

// Pasangan ringkas (anggota nyata yang punya halaman sendiri).
export type PartnerLite = {
  id: string;
  name: string;
  number: string | null;
  isDeceased: boolean;
  avatarUrl: string | null;
};

// Anak ringkas untuk kartu hubungan.
export type ChildLite = {
  id: string;
  name: string;
  number: string | null;
  avatarUrl: string | null;
  isDeceased: boolean;
  spouseName: string | null;
};

// Anggota lengkap untuk halaman profil individu.
export type MemberFull = {
  id: string;
  number: string | null;
  name: string;
  isDeceased: boolean;
  marriedIn: boolean;
  gender: string | null;
  bio: string | null;
  birthInfo: string | null;
  order: number;
  parentId: string | null;
  avatarUrl: string | null;
  familyPhotoUrl: string | null;
  anchorId: string; // pusat keluarga (garis keturunan) untuk /keluarga
  anchorParentId: string | null;
  partner: PartnerLite | null;
  parent: { id: string; name: string; number: string | null } | null;
  children: ChildLite[];
  photos: Photo[];
};
