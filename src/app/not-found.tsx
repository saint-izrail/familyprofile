// Halaman 404 — server component bergaya pusaka (emerald + emas).
import Link from "next/link";
import { IconTree, IconArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="bg-grid">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <span
          aria-hidden
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-edge bg-surface-2 text-primary shadow-ambient-lg ring-glow"
        >
          <IconTree className="h-8 w-8" />
        </span>

        <p className="font-serif text-7xl font-extrabold gold-text sm:text-8xl">404</p>

        <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">
          Halaman tidak ditemukan
        </h1>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Maaf, dahan yang Anda cari tidak ada di pohon keluarga ini. Mungkin tautannya keliru
          atau halaman telah dipindahkan.
        </p>

        <div className="divider-gold my-8 max-w-xs" />

        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full bg-primary-dark px-6 py-3 text-sm font-semibold text-on-accent shadow-ambient-lg transition-transform hover:scale-[1.02] active:scale-95"
        >
          Kembali ke Beranda
          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </main>
  );
}
