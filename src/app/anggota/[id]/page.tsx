import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberFull } from "@/lib/members";
import { initials, displayName } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { IconArrowLeft, IconUser, IconUsers, IconPhoto, IconCalendar, IconArrowRight } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let member;
  try {
    member = await getMemberFull(id);
  } catch {
    notFound();
  }
  if (!member) notFound();

  const isCouple = !!member.spouseName;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
      <Link
        href="/silsilah"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary-deep"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke silsilah
      </Link>

      {/* Kartu profil */}
      <Reveal className="mt-5">
        <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-surface p-8 shadow-ambient-lg ring-glow md:p-10">
          <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:text-left">
            <span className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold/40 bg-primary/10 text-3xl font-bold text-primary shadow-ambient">
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                initials(member.name)
              )}
            </span>
            <div className="min-w-0">
              {member.number && (
                <span className="inline-block rounded-full border border-gold/30 bg-gold-soft/30 px-3 py-0.5 text-xs font-semibold tracking-wider text-secondary">
                  {member.number}
                </span>
              )}
              <h1 className="mt-2 font-serif text-3xl font-extrabold text-ink md:text-4xl">
                {member.name}
                {member.isDeceased && <span className="ml-2 align-middle text-base font-normal text-muted">(alm)</span>}
              </h1>
              {isCouple && (
                <p className="mt-1 text-lg text-primary-deep">
                  &amp; {member.spouseName}
                  {member.spouseDeceased && <span className="text-muted"> (almh)</span>}
                </p>
              )}
              {member.birthInfo && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
                  <IconCalendar className="h-4 w-4" />
                  {member.birthInfo}
                </p>
              )}
            </div>
          </div>

          {member.bio && (
            <>
              <div className="divider-gold my-7" />
              <p className="relative whitespace-pre-line text-sm leading-relaxed text-muted md:text-base">
                {member.bio}
              </p>
            </>
          )}
        </section>
      </Reveal>

      {/* Foto keluarga */}
      {member.familyPhotoUrl && (
        <Reveal delay={80} className="mt-6">
          <figure className="overflow-hidden rounded-3xl border border-edge bg-surface shadow-ambient">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={member.familyPhotoUrl} alt={`Foto keluarga ${member.name}`} className="w-full object-cover" />
            <figcaption className="px-5 py-3 text-center text-xs text-muted">Foto Keluarga</figcaption>
          </figure>
        </Reveal>
      )}

      {/* Hubungan */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {member.parent && (
          <Reveal delay={120}>
            <div className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <IconUser className="h-4 w-4" /> Orang Tua
              </h2>
              <Link
                href={`/anggota/${member.parent.id}`}
                className="group flex items-center justify-between rounded-2xl border border-edge bg-surface-2 px-4 py-3 transition-all hover:border-gold/40 hover:bg-primary/5"
              >
                <span className="font-semibold text-ink">
                  {member.parent.name}
                  {member.parent.spouseName && ` & ${member.parent.spouseName}`}
                </span>
                <IconArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </div>
          </Reveal>
        )}

        {member.children.length > 0 && (
          <Reveal delay={160}>
            <div className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <IconUsers className="h-4 w-4" /> Anak ({member.children.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {member.children.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/anggota/${c.id}`}
                      className="group flex items-center gap-3 rounded-2xl border border-edge bg-surface-2 px-4 py-2.5 transition-all hover:border-gold/40 hover:bg-primary/5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/25 bg-primary/10 text-xs font-semibold text-primary">
                        {c.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          initials(c.name)
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                        {c.name}
                        {c.spouseName && ` & ${c.spouseName}`}
                        {c.isDeceased && <span className="text-muted"> (alm)</span>}
                      </span>
                      <IconArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </div>

      {/* Galeri foto */}
      {member.photos.length > 0 && (
        <Reveal delay={200} className="mt-6">
          <section className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <IconPhoto className="h-4 w-4" /> Galeri ({member.photos.length})
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {member.photos.map((ph) => (
                <figure key={ph.id} className="overflow-hidden rounded-2xl border border-edge bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph.url} alt={ph.caption ?? ""} className="aspect-square w-full object-cover transition-transform hover:scale-105" />
                  {ph.caption && <figcaption className="px-3 py-1.5 text-center text-[11px] text-muted">{ph.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        </Reveal>
      )}
    </main>
  );
}
