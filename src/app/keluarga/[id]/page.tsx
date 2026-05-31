import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFamily } from "@/lib/members";
import { initials } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { IconArrowLeft, IconUsers, IconArrowRight, IconHeart, IconCalendar, IconPhoto } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let fam;
  try {
    fam = await getFamily(id);
  } catch {
    fam = null;
  }
  if (!fam) return { title: "Keluarga tidak ditemukan" };
  const names = fam.members.map((m) => m.name).join(" & ");
  return {
    title: `Keluarga ${names} — Bani Amenan Effendi`,
    description: `Profil keluarga ${names}: foto keluarga, anggota, dan bio singkat.`,
    openGraph: { title: `Keluarga ${names}`, images: fam.familyPhotoUrl ? [fam.familyPhotoUrl] : undefined },
  };
}

export default async function FamilyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let fam;
  try {
    fam = await getFamily(id);
  } catch {
    notFound();
  }
  if (!fam) notFound();

  const title = fam.members.map((m) => m.name).join(" & ");

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <Link href="/silsilah" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary-deep">
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke silsilah
      </Link>

      {/* Header + Foto keluarga */}
      <Reveal className="mt-5">
        <section className="overflow-hidden rounded-3xl border border-gold/25 bg-surface shadow-ambient-lg ring-glow">
          {/* Foto keluarga (banner utama) */}
          <figure className="relative aspect-[16/9] w-full overflow-hidden border-b border-edge">
            {fam.familyPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fam.familyPhotoUrl} alt={`Foto keluarga ${title}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 via-surface to-gold/10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-primary/10 text-primary">
                  <IconPhoto className="h-7 w-7" />
                </span>
                <p className="text-sm text-muted">Foto keluarga belum ditambahkan</p>
              </div>
            )}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
          </figure>

          <div className="p-6 text-center md:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold-soft/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
              <IconUsers className="h-3.5 w-3.5" /> Profil Keluarga
            </span>
            <h1 className="mt-3 font-serif text-3xl font-extrabold gold-text md:text-4xl">{title}</h1>
          </div>
        </section>
      </Reveal>

      {/* Anggota inti + bio sekilas */}
      <Reveal delay={100} className="mt-6">
        <section className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient md:p-8">
          <h2 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <IconHeart className="h-4 w-4 text-secondary" /> Anggota Keluarga
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fam.members.map((m) => (
              <Link
                key={m.id}
                href={`/anggota/${m.id}`}
                className="group flex gap-4 rounded-2xl border border-edge bg-surface-2 p-4 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-ambient"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold/30 bg-primary/10 text-lg font-bold text-primary">
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    initials(m.name)
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-base font-bold text-ink">
                    {m.name}
                    {m.isDeceased && <span className="font-normal text-muted"> (alm)</span>}
                  </p>
                  {m.birthInfo && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
                      <IconCalendar className="h-3 w-3" /> {m.birthInfo}
                    </p>
                  )}
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted">
                    {m.bio ?? <span className="italic opacity-70">Belum ada bio singkat.</span>}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Anak */}
      {fam.children.length > 0 && (
        <Reveal delay={160} className="mt-6">
          <section className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient md:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <IconUsers className="h-4 w-4" /> Anak ({fam.children.length})
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {fam.children.map((c) => (
                <li key={c.id}>
                  <Link href={`/anggota/${c.id}`} className="group flex items-start gap-3 rounded-2xl border border-edge bg-surface-2 px-4 py-3 transition-all hover:border-gold/40 hover:bg-primary/5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/25 bg-primary/10 text-sm font-semibold text-primary">
                      {c.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials(c.name)
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {c.name}
                        {c.spouseName && ` & ${c.spouseName}`}
                        {c.isDeceased && <span className="font-normal text-muted"> (alm)</span>}
                      </span>
                      {c.bio && <span className="mt-1 line-clamp-2 block text-xs text-muted">{c.bio}</span>}
                    </span>
                    <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      )}
    </main>
  );
}
