// Kalkulator hubungan kekerabatan antar anggota (operasi murni pada daftar datar).
// Pasangan (marriedIn) dipetakan ke posisi garis keturunan pasangannya.
import type { FlatMember } from "@/lib/members";

function effectiveId(id: string, byId: Map<string, FlatMember>): string {
  const m = byId.get(id);
  return m && m.marriedIn && m.partnerId && byId.has(m.partnerId) ? m.partnerId : id;
}

function ancestors(id: string, byId: Map<string, FlatMember>): string[] {
  const out: string[] = [];
  let cur = byId.get(id);
  let guard = 0;
  while (cur && guard++ < 60) {
    out.push(cur.id);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return out;
}

export type RelationResult = {
  label: string;
  detail: string;
  lcaId: string | null;
  da: number;
  db: number;
};

export function relationship(aId: string, bId: string, flat: FlatMember[]): RelationResult | null {
  const byId = new Map(flat.map((m) => [m.id, m]));
  if (!byId.has(aId) || !byId.has(bId)) return null;
  if (aId === bId) return { label: "orang yang sama", detail: "", lcaId: aId, da: 0, db: 0 };

  const aName = byId.get(aId)?.name ?? "A";
  const bName = byId.get(bId)?.name ?? "B";

  const aEff = effectiveId(aId, byId);
  const bEff = effectiveId(bId, byId);

  // Pasangan langsung (suami/istri)
  if (aEff === bEff) {
    return { label: `${bName} adalah suami/istri dari ${aName}`, detail: "Pasangan dalam satu keluarga.", lcaId: aEff, da: 0, db: 0 };
  }

  const aAnc = ancestors(aEff, byId);
  const bAnc = ancestors(bEff, byId);
  const bSet = new Set(bAnc);
  let lca: string | null = null;
  for (const x of aAnc) {
    if (bSet.has(x)) {
      lca = x;
      break;
    }
  }
  if (!lca) {
    return { label: `${bName} adalah kerabat dari ${aName}`, detail: "Tidak ada leluhur bersama yang tercatat.", lcaId: null, da: -1, db: -1 };
  }
  const da = aAnc.indexOf(lca);
  const db = bAnc.indexOf(lca);

  let rel: string;
  if (da === 0) {
    rel = ["orang yang sama", "anak", "cucu", "cicit", "canggah"][db] ?? `keturunan (generasi ke-${db})`;
  } else if (db === 0) {
    rel = ["orang yang sama", "orang tua", "kakek/nenek", "buyut", "canggah"][da] ?? `leluhur (generasi ke-${da})`;
  } else if (da === 1 && db === 1) {
    rel = "saudara";
  } else if (da === 1) {
    rel = db === 2 ? "keponakan" : `keponakan (${db - 1}× terpisah)`;
  } else if (db === 1) {
    rel = da === 2 ? "paman/bibi" : `paman/bibi (${da - 1}× terpisah)`;
  } else {
    const cousinLevel = Math.min(da, db) - 1;
    const removed = Math.abs(da - db);
    rel = removed === 0 ? `sepupu ke-${cousinLevel}` : `sepupu ke-${cousinLevel} (${removed}× terpisah)`;
  }

  const lcaName = lca ? byId.get(lca)?.name : null;
  const detail = lcaName ? `Leluhur bersama: ${lcaName}.` : "";
  return { label: `${bName} adalah ${rel} dari ${aName}`, detail, lcaId: lca, da, db };
}
