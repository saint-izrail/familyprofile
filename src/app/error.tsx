"use client";

// Batas galat per-segmen (Next 16: prop pemulihan = unstable_retry, bukan reset).
// Gaya pusaka selaras not-found.tsx.
import { useEffect } from "react";
import Link from "next/link";
import { IconTree, IconArrowRight } from "@/components/icons";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Catat ke konsol (bisa diganti layanan pelaporan galat).
    console.error(error);
  }, [error]);

  return (
    <main className="bg-grid">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <span
          aria-hidden
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-edge bg-surface-2 text-primary shadow-ambient-lg ring-glow"
        >
          <IconTree className="h-8 w-8" />
        </span>

        <p className="font-serif text-5xl font-extrabold gold-text sm:text-6xl">Ada gangguan</p>

        <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">Halaman gagal dimuat</h1>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Maaf, terjadi kendala sesaat ketika memuat halaman ini — mungkin sambungan sedang
          tersendat. Silakan coba lagi.
        </p>

        {error?.digest && (
          <p className="mt-2 font-mono text-[11px] text-muted">Kode rujukan: {error.digest}</p>
        )}

        <div className="divider-gold my-8 max-w-xs" />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="group inline-flex items-center gap-2 rounded-full bg-primary-dark px-6 py-3 text-sm font-semibold text-on-accent shadow-ambient-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            Coba lagi
            <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-edge-strong bg-surface-2 px-6 py-3 text-sm font-semibold text-primary-deep transition-colors hover:bg-primary/5"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
