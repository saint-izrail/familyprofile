import Link from "next/link";
import { getTree, getLandingPhotos, type TreeMember } from "@/lib/members";
import { Reveal } from "@/components/reveal";
import { BackgroundFX } from "@/components/background-fx";
import { HeroCarousel } from "@/components/hero-carousel";
import { IconTree, IconList, IconUsers, IconHeart, IconArrowRight, IconSparkle } from "@/components/icons";

export const dynamic = "force-dynamic";

function countNodes(nodes: TreeMember[]): number {
  return nodes.reduce((n, x) => n + 1 + countNodes(x.children), 0);
}

export default async function HomePage() {
  let tree: TreeMember[] = [];
  let failed = false;
  try {
    tree = await getTree();
  } catch {
    failed = true;
  }
  let photos: { url: string; caption: string | null }[] = [];
  try {
    photos = await getLandingPhotos();
  } catch {
    /* abaikan */
  }
  const root = tree[0] ?? null;
  const families = root?.children.length ?? 0;
  const total = countNodes(tree);

  const stats = [
    { label: "Keluarga", value: families || "—", icon: IconHeart },
    { label: "Anggota", value: total || "—", icon: IconUsers },
    { label: "Generasi", value: total ? "4+" : "—", icon: IconSparkle },
  ];

  return (
    <main className="relative overflow-hidden">
      <BackgroundFX variant="hero" />

      {/* HERO */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-12 pt-16 text-center md:pt-24">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-surface-2 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary backdrop-blur">
            <IconTree className="h-3.5 w-3.5" />
            Silsilah Keluarga
          </span>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="mt-6 font-serif text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-7xl">
            <span className="gold-text">Bani Amenan Effendi</span>
            <span className="mt-2 block text-ink">&amp; Siti Djamilah</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted md:text-lg">
            Merawat tali silaturahmi keluarga besar — menelusuri pohon keturunan, mengenal setiap
            anggota, dan menyimpan kenangan dalam satu rumah digital.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/silsilah"
              className="btn-shine inline-flex items-center gap-2 rounded-full bg-primary-dark px-7 py-3.5 text-sm font-semibold text-on-accent shadow-ambient-lg transition-all hover:bg-primary-deep active:scale-[0.98]"
            >
              Lihat Pohon Silsilah
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 rounded-full border border-edge-strong bg-surface-2 px-7 py-3.5 text-sm font-semibold text-primary-deep transition-all hover:bg-primary/5 active:scale-[0.98]"
            >
              <IconList className="h-4 w-4" />
              Daftar Anggota
            </Link>
          </div>
        </Reveal>

        {/* Foto keluarga (carousel auto-geser) */}
        <Reveal delay={400} className="mt-14 w-full">
          <div className="mx-auto w-full max-w-4xl">
            {photos.length > 0 ? (
              <HeroCarousel photos={photos} />
            ) : (
              <figure className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-gold/25 bg-surface ring-glow">
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 via-surface to-gold/10 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-primary/10 text-primary">
                    <IconTree className="h-8 w-8" />
                  </span>
                  <p className="font-serif text-lg text-primary-deep">Foto keluarga besar</p>
                  <p className="max-w-xs text-xs text-muted">
                    Tambahkan foto lewat admin (edit &ldquo;Amenan Effendi&rdquo; → Galeri) — akan tampil bergiliran di sini.
                  </p>
                </div>
                <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
              </figure>
            )}
          </div>
        </Reveal>

        {/* Statistik */}
        <Reveal delay={500} className="mt-12 w-full">
          <div className="mx-auto grid max-w-3xl grid-cols-3 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="hover-lift flex flex-col items-center gap-1 rounded-2xl border border-edge bg-surface px-4 py-6 shadow-ambient"
                >
                  <Icon className="mb-1 h-5 w-5 text-secondary" />
                  <span className="font-serif text-2xl font-bold gold-text md:text-3xl">{s.value}</span>
                  <span className="text-[11px] uppercase tracking-wider text-muted">{s.label}</span>
                </div>
              );
            })}
          </div>
        </Reveal>

        {failed && (
          <p className="mt-8 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-secondary">
            Database belum tersambung — data anggota akan muncul setelah konfigurasi selesai.
          </p>
        )}
      </section>

      {/* Jelajahi */}
      <section className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { href: "/silsilah", icon: IconTree, title: "Pohon Silsilah", desc: "Telusuri seluruh keturunan dalam tampilan pohon yang bisa di-zoom & digeser." },
            { href: "/daftar", icon: IconList, title: "Daftar Lengkap", desc: "Lihat seluruh anggota dalam format daftar bertingkat yang rapi." },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.href}>
                <Link
                  href={c.href}
                  className="hover-lift group flex items-start gap-4 rounded-3xl border border-edge bg-surface p-6 shadow-ambient"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-primary/10 text-primary transition-colors group-hover:bg-primary-dark group-hover:text-on-accent">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-primary-deep">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted">{c.desc}</p>
                  </div>
                  <IconArrowRight className="ml-auto h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </main>
  );
}
