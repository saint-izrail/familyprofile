"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconEdit, IconTrash, IconClose, IconCalendar } from "@/components/icons";

type EventItem = {
  id: string;
  title: string;
  type: string;
  recurring: boolean;
  description: string | null;
  memberId: string | null;
  memberName: string | null;
  date: string;
  nextDate: string;
  daysUntil: number;
};

type FlatMember = {
  id: string;
  number: string | null;
  name: string;
  spouseName: string | null;
  parentId: string | null;
  partnerId: string | null;
  marriedIn: boolean;
};

type FormState = {
  title: string;
  date: string;
  type: string;
  recurring: boolean;
  memberId: string;
  description: string;
};

const EMPTY: FormState = {
  title: "",
  date: "",
  type: "acara",
  recurring: false,
  memberId: "",
  description: "",
};

// Label & gaya badge per jenis acara.
const TYPE_META: Record<string, { label: string; badge: string }> = {
  "ulang-tahun": {
    label: "Ulang Tahun",
    badge: "border-gold/30 bg-gold/10 text-secondary",
  },
  acara: {
    label: "Acara",
    badge: "border-primary/25 bg-primary/10 text-primary-deep",
  },
  rencana: {
    label: "Rencana",
    badge: "border-edge-strong bg-surface-3 text-muted",
  },
};

const TYPE_OPTIONS = ["ulang-tahun", "acara", "rencana"] as const;

function typeMeta(type: string) {
  return TYPE_META[type] ?? { label: type, badge: "border-edge bg-surface-3 text-muted" };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function EventsAdmin({ events, members }: { events: EventItem[]; members: FlatMember[] }) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const memberLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.id, `${m.number ? m.number + " " : ""}${m.name}`);
    return map;
  }, [members]);

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setNotice(null);
    setPanelOpen(true);
  }

  function openEdit(ev: EventItem) {
    setEditing(ev);
    setForm({
      title: ev.title,
      date: ev.date.slice(0, 10),
      type: ev.type,
      recurring: ev.recurring,
      memberId: ev.memberId ?? "",
      description: ev.description ?? "",
    });
    setError(null);
    setNotice(null);
    setPanelOpen(true);
  }

  function close() {
    setPanelOpen(false);
    setEditing(null);
    setForm(EMPTY);
    setError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }
    if (!form.date) {
      setError("Tanggal wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title.trim(),
      date: form.date,
      type: form.type,
      recurring: form.recurring,
      description: form.description.trim() || null,
      memberId: form.memberId || null,
    };
    try {
      const res = editing
        ? await fetch(`/api/events/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setNotice(editing ? "Perubahan tersimpan." : "Momen ditambahkan.");
        close();
        router.refresh();
      } else {
        setError(json?.message ?? "Gagal menyimpan.");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function del(ev: EventItem) {
    if (!window.confirm(`Hapus "${ev.title}"?`)) return;
    try {
      const res = await fetch(`/api/events/${ev.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setNotice(`"${ev.title}" dihapus.`);
        router.refresh();
      } else {
        window.alert(json?.message ?? "Gagal menghapus.");
      }
    } catch {
      window.alert("Gagal terhubung ke server.");
    }
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-primary-deep">Agenda &amp; Momen</h2>
          <p className="text-sm text-muted">{events.length} momen terdaftar</p>
        </div>
        {!panelOpen && (
          <button
            onClick={openCreate}
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-primary-dark px-5 py-2.5 text-sm font-semibold text-on-accent shadow-ambient transition-all hover:bg-primary-deep active:scale-95"
          >
            <IconPlus className="h-4 w-4" /> Tambah Momen
          </button>
        )}
      </div>

      {notice && (
        <p className="mt-4 rounded-xl border border-success/25 bg-success/5 px-4 py-2.5 text-sm text-success">
          {notice}
        </p>
      )}

      {/* Form panel (tambah / edit) */}
      {panelOpen && (
        <div className="mt-5 rounded-2xl border border-gold/25 bg-surface p-6 shadow-ambient-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-primary-deep">
              {editing ? "Edit Momen" : "Tambah Momen"}
            </h3>
            <button onClick={close} className="text-muted hover:text-ink" aria-label="Tutup">
              <IconClose className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Judul *">
                <input
                  className={inp}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="mis. Ulang tahun Kakek"
                />
              </Field>
            </div>
            <Field label="Tanggal *">
              <input
                type="date"
                className={inp}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </Field>
            <Field label="Jenis">
              <select className={inp} value={form.type} onChange={(e) => set("type", e.target.value)}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {typeMeta(t).label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Anggota terkait">
              <select
                className={inp}
                value={form.memberId}
                onChange={(e) => set("memberId", e.target.value)}
              >
                <option value="">— Tidak terkait —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {memberLabel.get(m.id)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(e) => set("recurring", e.target.checked)}
                />
                Berulang tiap tahun
              </label>
            </div>
            <div className="sm:col-span-2">
              <Field label="Deskripsi">
                <textarea
                  className={`${inp} min-h-24`}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Catatan singkat (opsional)"
                />
              </Field>
            </div>

            {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}

            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-primary-dark py-3 text-sm font-semibold text-on-accent transition-all hover:bg-primary-deep disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah"}
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-xl border border-edge px-6 py-3 text-sm font-semibold text-muted hover:bg-surface-2"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar momen */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-edge bg-surface shadow-ambient">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <IconCalendar className="h-8 w-8 text-muted" />
            <p className="text-sm text-muted">Belum ada momen. Klik &ldquo;Tambah Momen&rdquo;.</p>
          </div>
        ) : (
          <ul className="divide-y divide-edge">
            {sorted.map((ev) => {
              const meta = typeMeta(ev.type);
              return (
                <li
                  key={ev.id}
                  className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-primary/[0.03]"
                >
                  <span className="mt-0.5 hidden shrink-0 text-muted sm:block">
                    <IconCalendar className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                      <span className="truncate">{ev.title}</span>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                      {ev.recurring && (
                        <span className="shrink-0 rounded-full border border-edge-strong bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-muted">
                          tiap tahun
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(ev.date)}
                      {ev.memberName && <span> · {ev.memberName}</span>}
                    </p>
                    {ev.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{ev.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => openEdit(ev)}
                      title="Edit"
                      aria-label={`Edit ${ev.title}`}
                      className="rounded-lg border border-edge p-2 text-primary-deep hover:bg-primary/5"
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => del(ev)}
                      title="Hapus"
                      aria-label={`Hapus ${ev.title}`}
                      className="rounded-lg border border-danger/30 p-2 text-danger hover:bg-danger/5"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

const inp =
  "w-full rounded-xl border border-edge-strong bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-primary-dark focus:bg-surface-3 focus:ring-4 focus:ring-primary/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="ml-1 text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
