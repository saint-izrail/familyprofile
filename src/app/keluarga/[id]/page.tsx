import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFamily } from "@/lib/members";
import { initials } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { IconArrowLeft, IconUsers, IconArrowRight, IconHeart } from "@/components/icons";

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
  return { title: `Keluarga ${names} — Bani Amenan Effendi`, description: `Profil keluarga ${names}.` };
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

      <Reveal className="mt-5">
        <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-surface p-8 text-center shadow-ambient-lg ring-glow md:p-10">
          <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold-soft/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
              <IconUsers className="h-3.5 w-3.5" /> Profil Keluarga
            </span>
            <h1 className="mt-4 font-serif text-3xl font-extrabold gold-text md:text-4xl">{title}</h1>
            {fam.number && <p className="mt-1 text-sm font-semibold tracking-wider text-secondary">{fam.number}</p>}

            {/* Pasangan */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {fam.members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-4">
                  {i > 0 && <IconHeart className="h-6 w-6 text-secondary" />}
                  <Link
                    href={`/anggota/${m.id}`}
                    className="group flex w-44 flex-col items-center gap-2 rounded-2xl border border-edge bg-surface-3 p-5 shadow-ambient transition-all hover:-translate-y-1 hover:border-gold/45 hover:shadow-ambient-lg"
                  >
                    <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-gold/40 bg-primary/10 text-2xl font-bold text-primary">
                      {m.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                      ) : (
                        initials(m.name)
                      )}
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {m.name}
                      {m.isDeceased && <span className="font-normal text-muted"> (alm)</span>}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted">{m.role}</span>
                  </Link>
                </div>
              ))}
            </div>

            {fam.bio && <p className="mx-auto mt-7 max-w-xl whitespace-pre-line text-sm text-muted">{fam.bio}</p>}
          </div>
        </section>
      </Reveal>

      {/* Foto keluarga */}
      {fam.familyPhotoUrl && (
        <Reveal delay={80} className="mt-6">
          <figure className="overflow-hidden rounded-3xl border border-edge bg-surface shadow-ambient">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fam.familyPhotoUrl} alt={`Foto keluarga ${title}`} className="w-full object-cover" />
            <figcaption className="px-5 py-3 text-center text-xs text-muted">Foto Keluarga</figcaption>
          </figure>
        </Reveal>
      )}

      {/* Anak */}
      {fam.children.length > 0 && (
        <Reveal delay={120} className="mt-6">
          <section className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient md:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <IconUsers className="h-4 w-4" /> Anak ({fam.children.length})
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {fam.children.map((c) => (
                <li key={c.id}>
                  <Link href={`/anggota/${c.id}`} className="group flex items-center gap-3 rounded-2xl border border-edge bg-surface-2 px-4 py-3 transition-all hover:border-gold/40 hover:bg-primary/5">
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
                      {c.number && <span className="block text-[10px] tracking-wider text-secondary">{c.number}</span>}
                    </span>
                    <IconArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
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
