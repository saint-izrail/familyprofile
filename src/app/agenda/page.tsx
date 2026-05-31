import Link from "next/link";
import { getUpcomingEvents, type EventItem } from "@/lib/events";
import { Reveal } from "@/components/reveal";
import { IconCalendar, IconSparkle, IconHeart, IconArrowRight } from "@/components/icons";

export const dynamic = "force-dynamic";

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
  try {
    events = await getUpcomingEvents();
  } catch {
    events = [];
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Reveal>
        <header className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
            <IconCalendar className="h-3.5 w-3.5" />
            Agenda Keluarga
          </span>
          <h1 className="mt-4 font-serif text-3xl font-extrabold md:text-5xl">
            <span className="gold-text">Agenda &amp; Momen</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Ulang tahun, acara, dan rencana keluarga besar yang menanti di
            depan. Mari rayakan setiap momen bersama.
          </p>
          <div className="divider-gold mx-auto mt-5 max-w-xs" />
        </header>
      </Reveal>

      {events.length === 0 ? (
        <Reveal delay={80}>
          <div className="rounded-3xl border border-edge bg-surface p-14 text-center shadow-ambient">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <IconCalendar className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-bold text-primary-deep">
              Belum ada agenda mendatang.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Tandai tanggal-tanggal istimewa keluarga agar tak terlewat.
              Agenda yang akan datang tampil di sini.
            </p>
          </div>
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
