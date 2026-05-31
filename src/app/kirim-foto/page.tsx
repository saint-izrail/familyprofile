import { Suspense } from "react";
import { getFlatMembers, type FlatMember } from "@/lib/members";
import { PhotoRequestForm } from "@/components/photo-request-form";
import { Reveal } from "@/components/reveal";
import { IconUpload } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function KirimFotoPage() {
  let members: FlatMember[] = [];
  let failed = false;
  try {
    members = await getFlatMembers();
  } catch {
    failed = true;
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 md:px-6">
      <Reveal>
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
            <IconUpload className="h-3.5 w-3.5" />
            Kirim Foto
          </span>
          <h1 className="mt-4 font-serif text-3xl font-extrabold md:text-5xl">
            <span className="gold-text">Kirim Foto</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Bagikan foto kenangan keluarga di sini. Foto akan tampil di halaman
            anggota setelah disetujui oleh admin.
          </p>
          <div className="divider-gold mx-auto mt-5 max-w-xs" />
        </header>
      </Reveal>

      <Reveal delay={80}>
        {failed || members.length === 0 ? (
          <div className="rounded-3xl border border-edge bg-surface p-14 text-center shadow-ambient">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <IconUpload className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-bold text-primary-deep">
              {failed ? "Belum tersambung ke database" : "Belum ada data anggota"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              {failed
                ? "Formulir akan tampil setelah konfigurasi database selesai."
                : "Tambahkan anggota terlebih dahulu melalui halaman admin."}
            </p>
          </div>
        ) : (
          <Suspense fallback={null}>
            <PhotoRequestForm members={members} />
          </Suspense>
        )}
      </Reveal>
    </main>
  );
}
