import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMemberFull, getAncestry, getSiblings } from "@/lib/members";
import { initials } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { ShareButton } from "@/components/share-button";
import {
  IconArrowLeft,
  IconUser,
  IconUsers,
  IconPhoto,
  IconCalendar,
  IconArrowRight,
  IconChevronRight,
  IconHeart,
} from "@/components/icons";

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
  const name = m.spouseName ? `${m.name} & ${m.spouseName}` : m.name;
  const desc = m.bio ?? `Profil ${name} — keluarga besar Bani Amenan Effendi & Siti Djamilah.`;
  return {
    title: `${name} — Bani Amenan Effendi`,
    description: desc,
    openGraph: { title: name, description: desc, images: m.avatarUrl ? [m.avatarUrl] : undefined },
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

  const [ancestry, siblings] = await Promise.all([
    getAncestry(id).catch(() => []),
    getSiblings(id, member.parentId).catch(() => []),
  ]);
  const trail = ancestry.slice(0, -1); // tanpa diri sendiri
  const isCouple = !!member.spouseName;
  const fullName = isCouple ? `${member.name} & ${member.spouseName}` : member.name;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/silsilah"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary-deep"
        >
          <IconArrowLeft className="h-4 w-4" />
          Kembali ke silsilah
        </Link>
        <ShareButton title={`${fullName} — Bani Amenan Effendi`} />
      </div>

      {/* Breadcrumb leluhur */}
      {trail.length > 0 && (
        <nav aria-label="Garis keturunan" className="mt-4 flex flex-wrap items-center gap-1 text-xs text-muted">
          {trail.map((c) => (
            <span key={c.id} className="flex items-center gap-1">
              <Link href={`/anggota/${c.id}`} className="rounded px-1.5 py-0.5 transition-colors hover:bg-primary/10 hover:text-primary-deep">
                {c.name}
              </Link>
              <IconChevronRight className="h-3 w-3 opacity-50" />
            </span>
          ))}
          <span className="px-1.5 py-0.5 font-semibold text-primary-deep">{member.name}</span>
        </nav>
      )}

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
                <p className="mt-1 inline-flex items-center gap-1.5 text-lg text-primary-deep">
                  <IconHeart className="h-4 w-4 text-secondary" />
                  {member.spouseName}
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
              <p className="relative whitespace-pre-line text-sm leading-relaxed text-muted md:text-base">{member.bio}</p>
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

      {/* Hubungan: orang tua + saudara */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {member.parent && (
          <Reveal delay={120}>
            <RelCard title="Orang Tua" icon={<IconUser className="h-4 w-4" />}>
              <RelLink href={`/anggota/${member.parent.id}`} label={`${member.parent.name}${member.parent.spouseName ? ` & ${member.parent.spouseName}` : ""}`} />
            </RelCard>
          </Reveal>
        )}
        {siblings.length > 0 && (
          <Reveal delay={160}>
            <RelCard title={`Saudara (${siblings.length})`} icon={<IconUsers className="h-4 w-4" />}>
              <ul className="flex flex-col gap-2">
                {siblings.map((s) => (
                  <li key={s.id}>
                    <PersonRow id={s.id} name={s.name} spouseName={s.spouseName} avatarUrl={s.avatarUrl} isDeceased={s.isDeceased} />
                  </li>
                ))}
              </ul>
            </RelCard>
          </Reveal>
        )}
      </div>

      {/* Anak */}
      {member.children.length > 0 && (
        <Reveal delay={200} className="mt-6">
          <RelCard title={`Anak (${member.children.length})`} icon={<IconUsers className="h-4 w-4" />}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {member.children.map((c) => (
                <li key={c.id}>
                  <PersonRow id={c.id} name={c.name} spouseName={c.spouseName} avatarUrl={c.avatarUrl} isDeceased={c.isDeceased} />
                </li>
              ))}
            </ul>
          </RelCard>
        </Reveal>
      )}

      {/* Galeri */}
      {member.photos.length > 0 && (
        <Reveal delay={240} className="mt-6">
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

function RelCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

function RelLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-edge bg-surface-2 px-4 py-3 transition-all hover:border-gold/40 hover:bg-primary/5"
    >
      <span className="font-semibold text-ink">{label}</span>
      <IconArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}

function PersonRow({
  id,
  name,
  spouseName,
  avatarUrl,
  isDeceased,
}: {
  id: string;
  name: string;
  spouseName: string | null;
  avatarUrl: string | null;
  isDeceased: boolean;
}) {
  return (
    <Link
      href={`/anggota/${id}`}
      className="group flex items-center gap-3 rounded-2xl border border-edge bg-surface-2 px-4 py-2.5 transition-all hover:border-gold/40 hover:bg-primary/5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/25 bg-primary/10 text-xs font-semibold text-primary">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
        {name}
        {spouseName && ` & ${spouseName}`}
        {isDeceased && <span className="text-muted"> (alm)</span>}
      </span>
      <IconArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
