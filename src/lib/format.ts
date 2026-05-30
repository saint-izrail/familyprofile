// Inisial nama untuk avatar fallback.
export function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

// Nama tampil (gabungkan pasangan bila ada).
export function displayName(m: { name: string; spouseName?: string | null }): string {
  return m.spouseName ? `${m.name} & ${m.spouseName}` : m.name;
}
