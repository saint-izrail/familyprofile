import Link from "next/link";
import type { Metadata } from "next";
import { getStats, type Stats } from "@/lib/members";
import { Reveal } from "@/components/reveal";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  IconUsers,
  IconHeart,
  IconLeaf,
  IconSparkle,
  IconArrowRight,
} from "@/components/icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Statistik" };

type StatCard = {
  label: string;
  value: number;
  icon: typeof IconUsers;
  note?: string;
};

export default async function StatistikPage() {
  let stats: Stats | null = null;
  let failed = false;
  try {
    stats = await getStats();
  } catch {
    failed = true;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageHeader
        eyebrow="Statistik Keluarga"
        icon={IconSparkle}
        title="Statistik Keluarga"
        subtitle="Ringkasan angka perjalanan keluarga besar kita lintas generasi."
      />

      {failed || !stats ? (
        <Reveal delay={80}>
          <EmptyState
            icon={IconSparkle}
            title="Belum tersambung ke database"
            description="Statistik akan tampil setelah konfigurasi database selesai."
          />
        </Reveal>
      ) : (
        <StatistikContent stats={stats} />
      )}
    </main>
  );
}

function StatistikContent({ stats }: { stats: Stats }) {
  const cards: StatCard[] = [
    { label: "Total Anggota", value: stats.total, icon: IconUsers },
    { label: "Keluarga / Pasangan", value: stats.couples, icon: IconHeart },
    {
      label: "In Memoriam",
      value: stats.deceased,
      icon: IconLeaf,
      note: "Semoga diterima di sisi-Nya",
    },
    { label: "Generasi", value: stats.generations, icon: IconSparkle },
  ];

  const families = [...stats.families].sort((a, b) => b.count - a.count);
  const maxCount = families.reduce((m, f) => Math.max(m, f.count), 0) || 1;

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Reveal key={c.label} delay={i * 40}>
              <div className="hover-lift h-full rounded-3xl border border-edge bg-surface p-6 text-center shadow-ambient">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-4 font-serif text-4xl font-extrabold">
                  <span className="gold-text">{c.value}</span>
                </div>
                <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {c.label}
                </div>
                {c.note ? (
                  <p className="mt-1 text-[11px] italic text-secondary">{c.note}</p>
                ) : null}
              </div>
            </Reveal>
          );
        })}
      </section>

      {families.length > 0 ? (
        <section className="mt-12">
          <Reveal>
            <h2 className="mb-6 font-serif text-2xl font-bold text-primary-deep">
              Ukuran Tiap Cabang
            </h2>
          </Reveal>

          <div className="space-y-3">
            {families.map((f, i) => {
              const name = f.name + (f.spouseName ? " & " + f.spouseName : "");
              const width = (f.count / maxCount) * 100;
              return (
                <Reveal key={f.id} delay={i * 40}>
                  <Link
                    href={`/anggota/${f.id}`}
                    className="hover-lift group flex items-center gap-4 rounded-2xl border border-edge bg-surface p-4 shadow-ambient"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate font-serif text-sm font-bold text-ink md:text-base">
                          {name}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-primary">
                          {f.count}
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                    <IconArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}
