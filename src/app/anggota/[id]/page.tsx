import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMemberFull } from "@/lib/members";
import { initials } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { ShareButton } from "@/components/share-button";
import { IconArrowLeft, IconUsers, IconPhoto, IconCalendar } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let m;
  try {
    m = await getMemberFull(id);
  } catch {
    m = null;
  }
  if (!m) return { title: "Anggota tidak ditemukan" };
  const desc = m.bio ?? `Profil ${m.name} — keluarga besar Bani Amenan Effendi & Siti Djamilah.`;
  return {
    title: `${m.name} — Bani Amenan Effendi`,
    description: desc,
    openGraph: { title: m.name, description: desc, images: m.avatarUrl ? [m.avatarUrl] : undefined },
  };
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let member;
  try {
    member = await getMemberFull(id);
  } catch {
    notFound();
  }
  if (!member) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/silsilah" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary-deep">
          <IconArrowLeft className="h-4 w-4" />
          Kembali ke silsilah
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/keluarga/${member.anchorId}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-soft/20 px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-gold/10"
          >
            <IconUsers className="h-4 w-4" /> Profil Keluarga
          </Link>
          <Link
            href={`/kirim-foto?member=${member.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2 px-4 py-2 text-sm font-medium text-primary-deep transition-colors hover:bg-primary/5"
          >
            <IconPhoto className="h-4 w-4" /> Kirim Foto
          </Link>
          <ShareButton title={`${member.name} — Bani Amenan Effendi`} />
        </div>
      </div>

      {/* Kartu profil: foto besar + identitas */}
      <Reveal className="mt-5">
        <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-surface p-6 shadow-ambient-lg ring-glow md:p-8">
          <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative flex flex-col items-center gap-7 md:flex-row md:items-start">
            {/* Foto besar */}
            <div className="w-full max-w-[16rem] shrink-0 overflow-hidden rounded-3xl border-2 border-gold/30 bg-primary/10 shadow-ambient md:w-64">
              <div className="aspect-square">
                {member.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-primary">{initials(member.name)}</div>
                )}
              </div>
            </div>

            {/* Identitas */}
            <div className="min-w-0 flex-1 text-center md:pt-2 md:text-left">
              <h1 className="font-serif text-3xl font-extrabold leading-tight text-ink md:text-4xl">
                {member.name}
                {member.isDeceased && <span className="ml-2 align-middle text-base font-normal text-muted">(alm)</span>}
              </h1>
              {member.birthInfo && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
                  <IconCalendar className="h-4 w-4" />
                  {member.birthInfo}
                </p>
              )}
              {member.bio ? (
                <>
                  <div className="divider-gold my-5 md:max-w-sm" />
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted md:text-base">{member.bio}</p>
                </>
              ) : (
                <p className="mt-4 text-sm italic text-muted/70">Belum ada catatan / bio.</p>
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Galeri foto */}
      {member.photos.length > 0 && (
        <Reveal delay={120} className="mt-6">
          <section className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <IconPhoto className="h-4 w-4" /> Galeri ({member.photos.length})
            </h2>
            <PhotoLightbox photos={member.photos} />
          </section>
        </Reveal>
      )}
    </main>
  );
}
