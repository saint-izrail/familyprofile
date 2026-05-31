// Footer global di bagian bawah halaman.
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const LINKS = [
  { href: "/silsilah", label: "Silsilah" },
  { href: "/daftar", label: "Daftar" },
  { href: "/agenda", label: "Agenda" },
  { href: "/statistik", label: "Statistik" },
  { href: "/kirim-foto", label: "Kirim Foto" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-edge bg-surface/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center">
        <BrandMark size="sm" />
        <nav aria-label="Tautan cepat" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs font-medium text-muted transition-colors hover:text-primary-deep"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="divider-gold max-w-xs" />
        <p className="text-xs text-muted">
          &copy; 2026 Keluarga Besar{" "}
          <span className="font-semibold text-ink">Bani Amenan Effendi &amp; Siti Djamilah</span>.
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Dipersembahkan oleh Farhan Surya Kusuma
        </p>
      </div>
    </footer>
  );
}
