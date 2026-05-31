import Link from "next/link";
import type { Metadata } from "next";
import { getUpcomingEvents, type EventItem } from "@/lib/events";
import { getFlatMembers, type FlatMember } from "@/lib/members";
import { Reveal } from "@/components/reveal";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { SuggestButton } from "@/components/suggest-button";
import { IconCalendar, IconSparkle, IconHeart, IconArrowRight } from "@/components/icons";

// Dinamis: "X hari lagi" / "Hari ini" dihitung dari tanggal saat ini, jadi
// tak boleh di-cache (ISR akan membekukan hitungan mundur & menahan acara lewat).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Agenda & Momen" };

const dayFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric" });
const monthFmt = new Intl.DateTimeFormat("id-ID", { month: "short" });
const fullFmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

type Kind = "ulang-tahun" | "acara" | "rencana";

const typeMeta: Record<
  Kind,
  { label: string; badge: string; icon: typeof IconCalendar }
> = {
  "ulang-tahun": {
    label: "Ulang Tahun",
    badge: "border-gold/40 bg-gold/10 text-secondary",
    icon: IconHeart,
  },
  acara: {
    label: "Acara",
    badge: "border-primary/30 bg-primary/10 text-primary",
    icon: IconCalendar,
  },
  rencana: {
    label: "Rencana",
    badge: "border-edge-strong bg-surface-2 text-secondary",
    icon: IconSparkle,
  },
};

function metaFor(type: string) {
  return typeMeta[(type as Kind) in typeMeta ? (type as Kind) : "acara"];
}

function countdownLabel(days: number): string {
  if (days <= 0) return "Hari ini";
  if (days === 1) return "Besok";
  return `${days} hari lagi`;
}

function countdownTone(days: number): string {
  if (days <= 0) return "border-primary/40 bg-primary/10 text-primary";
  if (days <= 7) return "border-gold/40 bg-gold/10 text-secondary";
  return "border-edge bg-surface-2 text-muted";
}

export default async function AgendaPage() {
  let events: EventItem[] = [];
  let members: FlatMember[] = [];
  try {
    [events, members] = await Promise.all([getUpcomingEvents(), getFlatMembers()]);
  } catch {
    events = [];
    members = [];
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <PageHeader
        eyebrow="Agenda Keluarga"
        icon={IconCalendar}
        title="Agenda & Momen"
        subtitle="Ulang tahun, acara, dan rencana keluarga besar yang menanti di depan. Mari rayakan setiap momen bersama."
        action={<SuggestButton kind="agenda" members={members} label="Usulkan Momen" />}
      />

      {events.length === 0 ? (
        <Reveal delay={80}>
          <EmptyState
            icon={IconCalendar}
            title="Belum ada agenda mendatang"
            description="Tandai tanggal-tanggal istimewa keluarga agar tak terlewat. Agenda yang akan datang tampil di sini."
          />
        </Reveal>
      ) : (
        <ol className="space-y-4">
          {events.map((ev, i) => {
            const meta = metaFor(ev.type);
            const Icon = meta.icon;
            const next = new Date(ev.nextDate);
            return (
              <li key={ev.id}>
                <Reveal delay={Math.min(i * 60, 360)}>
                  <article className="hover-lift flex gap-4 rounded-3xl border border-edge bg-surface p-5 shadow-ambient md:gap-5 md:p-6">
                    <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-edge bg-surface-2 px-3 py-3 text-center md:px-4">
                      <span className="font-serif text-3xl font-extrabold leading-none gold-text md:text-4xl">
                        {dayFmt.format(next)}
                      </span>
                      <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        {monthFmt.format(next)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.badge}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${countdownTone(ev.daysUntil)}`}
                        >
                          {countdownLabel(ev.daysUntil)}
                        </span>
                      </div>

                      <h3 className="mt-2 font-serif text-lg font-bold text-ink md:text-xl">
                        {ev.title}
                      </h3>

                      <p className="mt-1 text-xs text-muted">
                        {fullFmt.format(next)}
                        {ev.recurring && ev.type === "ulang-tahun"
                          ? " · berulang tiap tahun"
                          : null}
                      </p>

                      {ev.memberName && ev.memberId ? (
                        <Link
                          href={`/anggota/${ev.memberId}`}
                          className="group mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-deep"
                        >
                          {ev.memberName}
                          <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ) : null}

                      {ev.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-secondary">
                          {ev.description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
