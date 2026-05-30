// Footer global di bagian bawah halaman.
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-edge bg-surface/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center">
        <BrandMark size="sm" />
        <div className="divider-gold max-w-xs" />
        <p className="text-xs text-muted">
          &copy; 2026 Keluarga Besar{" "}
          <span className="font-semibold text-ink">Bani Amenan Effendi &amp; Siti Djamilah</span>.
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted/70">
          Dipersembahkan oleh Farhan Surya Kusuma
        </p>
      </div>
    </footer>
  );
}
