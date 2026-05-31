"use client";

// Antrean foto kiriman warga (self-service) yang menunggu persetujuan admin.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { IconPhoto, IconCheck, IconTrash } from "@/components/icons";

type PendingPhoto = {
  id: string;
  url: string;
  caption: string | null;
  submittedBy: string | null;
  createdAt: string;
  memberId: string;
  memberName: string;
};

// Tanggal relatif sederhana dalam Bahasa Indonesia.
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

export function RequestsAdmin({ pending }: { pending: PendingPhoto[] }) {
  const router = useRouter();
  // ID yang sudah ditangani -> disembunyikan secara optimistis.
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const visible = pending.filter((p) => !hidden.has(p.id));

  function mark(set: React.Dispatch<React.SetStateAction<Set<string>>>, id: string, on: boolean) {
    set((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function act(id: string, method: "PATCH" | "DELETE") {
    if (busy.has(id)) return;
    mark(setBusy, id, true);
    try {
      const res = await fetch(`/api/photos/${id}`, { method });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        mark(setHidden, id, true);
        router.refresh();
      } else {
        window.alert(json?.message ?? "Gagal memproses permintaan.");
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
            <IconPhoto className="h-6 w-6 text-secondary" />
          </span>
          <p className="text-sm font-medium text-muted">Belum ada permintaan foto.</p>
        </div>
      </Reveal>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {visible.map((p, i) => {
        const working = busy.has(p.id);
        return (
          <Reveal key={p.id} delay={i * 60}>
            <li className="flex h-full flex-col overflow-hidden rounded-2xl border border-edge bg-surface shadow-ambient transition-shadow hover:shadow-ambient-lg">
              {/* Foto */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.caption ?? `Foto untuk ${p.memberName}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Detail */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink" title={p.memberName}>
                    {p.memberName}
                  </p>
                  <span className="shrink-0 text-xs text-muted">{relativeDate(p.createdAt)}</span>
                </div>

                {p.caption && <p className="text-sm text-muted">{p.caption}</p>}

                <p className="mt-0.5 text-xs text-muted">
                  Dikirim oleh{" "}
                  <span className="font-medium text-secondary">{p.submittedBy ?? "Anonim"}</span>
                </p>

                {/* Aksi */}
                <div className="mt-auto flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => act(p.id, "PATCH")}
                    disabled={working}
                    className="btn-shine inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-dark px-3 py-2.5 text-sm font-semibold text-on-accent transition-all hover:bg-primary-deep active:scale-95 disabled:opacity-60"
                  >
                    <IconCheck className="h-4 w-4" /> Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => act(p.id, "DELETE")}
                    disabled={working}
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
