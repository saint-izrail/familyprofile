import type { Metadata } from "next";
import Link from "next/link";
import { IconTree, IconArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Luring" };

// Ditampilkan service worker saat navigasi gagal tanpa koneksi (di-precache).
export default function OfflinePage() {
  return (
    <main className="bg-grid">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <span
          aria-hidden
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-edge bg-surface-2 text-primary shadow-ambient-lg ring-glow"
        >
          <IconTree className="h-8 w-8" />
        </span>
        <p className="font-serif text-4xl font-extrabold gold-text sm:text-5xl">Sedang luring</p>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">Tidak ada koneksi</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Halaman ini belum tersimpan untuk dibaca luring. Periksa koneksi internet Anda, lalu coba
          lagi. Halaman yang pernah dibuka tetap bisa diakses.
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
