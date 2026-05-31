"use client";

// Antrean persetujuan admin untuk SEMUA jenis usulan publik
// (galeri, foto-profil, foto-keluarga, bio, agenda).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/reveal";
import type { SubmissionItem } from "@/lib/submissions";
import { initials } from "@/lib/format";
import {
  IconPhoto,
  IconUser,
  IconHeart,
  IconSparkle,
  IconCalendar,
  IconCheck,
  IconTrash,
} from "@/components/icons";

// Metadata per jenis usulan: label badge, ikon, dan gaya warna.
const KIND_META: Record<
  string,
  { label: string; Icon: typeof IconPhoto; badge: string; iconWrap: string }
> = {
  galeri: {
    label: "Foto Galeri",
    Icon: IconPhoto,
    badge: "border-primary/25 bg-primary/10 text-primary-deep",
    iconWrap: "border-primary/25 bg-primary/10 text-primary-deep",
  },
  "foto-profil": {
    label: "Foto Profil",
    Icon: IconUser,
    badge: "border-gold/30 bg-gold/10 text-secondary",
    iconWrap: "border-gold/30 bg-gold/10 text-secondary",
  },
  "foto-keluarga": {
    label: "Foto Keluarga",
    Icon: IconHeart,
    badge: "border-primary/25 bg-primary/[0.07] text-primary-deep",
    iconWrap: "border-primary/25 bg-primary/[0.07] text-primary-deep",
  },
  bio: {
    label: "Bio",
    Icon: IconSparkle,
    badge: "border-gold/30 bg-gold/[0.08] text-secondary",
    iconWrap: "border-gold/30 bg-gold/[0.08] text-secondary",
  },
  agenda: {
    label: "Agenda",
    Icon: IconCalendar,
    badge: "border-edge-strong bg-surface-3 text-muted",
    iconWrap: "border-edge-strong bg-surface-3 text-muted",
  },
};

function kindMeta(kind: string) {
  return (
    KIND_META[kind] ?? {
      label: kind,
      Icon: IconSparkle,
      badge: "border-edge bg-surface-3 text-muted",
      iconWrap: "border-edge bg-surface-3 text-muted",
    }
  );
}

const PHOTO_KINDS = new Set(["galeri", "foto-profil", "foto-keluarga"]);

const TYPE_LABEL: Record<string, string> = {
  "ulang-tahun": "Ulang Tahun",
  acara: "Acara",
  rencana: "Rencana",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Tanggal kirim relatif sederhana dalam Bahasa Indonesia.
function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SubmissionsAdmin({ submissions }: { submissions: SubmissionItem[] }) {
  const router = useRouter();
  // ID yang sudah ditangani -> disembunyikan secara optimistis.
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const visible = submissions.filter((s) => !hidden.has(s.id));

  function mark(
    set: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string,
    on: boolean,
  ) {
    set((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function act(id: string, method: "POST" | "DELETE") {
    if (busy.has(id)) return;
    mark(setBusy, id, true);
    try {
      const res = await fetch(`/api/submissions/${id}`, { method });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        mark(setHidden, id, true);
        router.refresh();
      } else {
        window.alert(json?.message ?? "Gagal memproses usulan.");
        mark(setBusy, id, false);
      }
    } catch {
      window.alert("Gagal terhubung ke server.");
      mark(setBusy, id, false);
    }
  }

  if (visible.length === 0) {
    return (
      <Reveal>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-edge bg-surface px-6 py-14 text-center shadow-ambient">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/5">
            <IconSparkle className="h-6 w-6 text-secondary" />
          </span>
          <p className="text-sm font-medium text-muted">Belum ada usulan masuk.</p>
        </div>
      </Reveal>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {visible.map((s, i) => {
        const meta = kindMeta(s.kind);
        const { Icon } = meta;
        const working = busy.has(s.id);
        const isPhoto = PHOTO_KINDS.has(s.kind);

        return (
          <Reveal key={s.id} delay={i * 60}>
            <li className="flex h-full flex-col overflow-hidden rounded-2xl border border-edge bg-surface shadow-ambient transition-shadow hover:shadow-ambient-lg">
              <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Header: badge jenis + tanggal kirim */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.badge}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {relativeDate(s.createdAt)}
                  </span>
                </div>

                {/* Target anggota (bila ada) */}
                {s.memberName && (
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-edge bg-surface-2 text-[10px] font-bold text-secondary">
                      {initials(s.memberName)}
                    </span>
                    <p
                      className="truncate text-sm font-semibold text-ink"
                      title={s.memberName}
                    >
                      {s.memberName}
                    </p>
                  </div>
                )}

                {/* Pratinjau spesifik per jenis */}
                {isPhoto && s.imageUrl && (
                  <div className="overflow-hidden rounded-xl border border-edge bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.imageUrl}
                      alt={s.caption ?? `Usulan ${meta.label}${s.memberName ? ` untuk ${s.memberName}` : ""}`}
                      className="max-h-72 w-full object-cover"
                    />
                  </div>
                )}

                {isPhoto && s.caption && (
                  <p className="text-sm text-muted">{s.caption}</p>
                )}

                {s.kind === "bio" && (
                  <blockquote className="rounded-xl border-l-2 border-gold/50 bg-surface-2 px-4 py-3 text-sm italic leading-relaxed text-ink">
                    {s.bio}
                  </blockquote>
                )}

                {s.kind === "agenda" && (
                  <div className="rounded-xl border border-edge bg-surface-2 px-4 py-3">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                      <span className="truncate">{s.title}</span>
                      {s.type && (
                        <span className="shrink-0 rounded-full border border-edge-strong bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-muted">
                          {TYPE_LABEL[s.type] ?? s.type}
                        </span>
                      )}
                      {s.recurring && (
                        <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-secondary">
                          tiap tahun
                        </span>
                      )}
                    </p>
                    {s.date && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                        <IconCalendar className="h-3.5 w-3.5" />
                        {formatDate(s.date)}
                      </p>
                    )}
                    {s.memberName && (
                      <p className="mt-1 text-xs text-muted">
                        Terkait: <span className="text-secondary">{s.memberName}</span>
                      </p>
                    )}
                    {s.description && (
                      <p className="mt-2 text-xs leading-relaxed text-muted">
                        {s.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Pengirim */}
                <p className="text-xs text-muted">
                  Dikirim oleh{" "}
                  <span className="font-medium text-secondary">
                    {s.submittedBy ?? "Anonim"}
                  </span>
                </p>

                {/* Aksi */}
                <div className="mt-auto flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => act(s.id, "POST")}
                    disabled={working}
                    aria-label={`Setujui usulan ${meta.label}`}
                    className="btn-shine inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-dark px-3 py-2.5 text-sm font-semibold text-on-accent transition-all hover:bg-primary-deep active:scale-95 disabled:opacity-60"
                  >
                    <IconCheck className="h-4 w-4" /> Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => act(s.id, "DELETE")}
                    disabled={working}
                    aria-label={`Tolak usulan ${meta.label}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-danger/30 px-3 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/5 active:scale-95 disabled:opacity-60"
                  >
                    <IconTrash className="h-4 w-4" /> Tolak
                  </button>
                </div>
              </div>
            </li>
          </Reveal>
        );
      })}
    </ul>
  );
}
