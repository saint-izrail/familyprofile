"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AdminMember } from "@/lib/members";
import { BrandMark } from "@/components/brand-mark";
import { ImageCropper } from "@/components/image-cropper";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUpload,
  IconLogout,
  IconExternal,
  IconClose,
  IconUsers,
} from "@/components/icons";

type FormState = {
  name: string;
  spouseName: string;
  number: string;
  parentId: string;
  birthInfo: string;
  bio: string;
  order: string;
  isDeceased: boolean;
  spouseDeceased: boolean;
  avatarUrl: string;
  familyPhotoUrl: string;
};

const EMPTY: FormState = {
  name: "",
  spouseName: "",
  number: "",
  parentId: "",
  birthInfo: "",
  bio: "",
  order: "0",
  isDeceased: false,
  spouseDeceased: false,
  avatarUrl: "",
  familyPhotoUrl: "",
};

function ImageInput({
  label,
  value,
  onChange,
  folder,
  storageOn,
  aspect,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  storageOn: boolean;
  aspect: number;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  // Pilih file -> buka cropper (geser/zoom) -> upload hasil crop.
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      setErr(null);
      setCropFile(file);
    }
  }

  async function uploadBlob(blob: Blob) {
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "photo.jpg");
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) onChange(json.url);
      else setErr(json?.message ?? "Gagal upload.");
    } catch {
      setErr("Gagal upload.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="ml-1 text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-edge bg-surface-2 text-[10px] text-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            "—"
          )}
        </span>
        <div className="flex flex-1 flex-col gap-2">
          {storageOn && (
            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-edge-strong bg-surface-2 px-3 py-1.5 text-xs font-semibold text-primary-deep transition-colors hover:bg-primary/5">
              <IconUpload className="h-3.5 w-3.5" />
              {busy ? "Mengunggah..." : "Upload"}
              <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
            </label>
          )}
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={storageOn ? "atau tempel URL gambar" : "tempel URL gambar"}
            className="w-full rounded-lg border border-edge bg-surface-2 px-3 py-1.5 text-xs text-ink outline-none focus:border-primary-dark"
          />
        </div>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-muted hover:text-danger" aria-label="Hapus gambar">
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </div>
      {err && <p className="ml-1 text-xs text-danger">{err}</p>}
      {cropFile && (
        <ImageCropper
          file={cropFile}
          aspect={aspect}
          onCancel={() => setCropFile(null)}
          onDone={(b) => {
            setCropFile(null);
            uploadBlob(b);
          }}
        />
      )}
    </div>
  );
}

export function AdminDashboard({
  members,
  storageOn,
  dbError,
}: {
  members: AdminMember[];
  storageOn: boolean;
  dbError: boolean;
}) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMember | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [galCaption, setGalCaption] = useState("");
  const [galBusy, setGalBusy] = useState(false);

  const labelOf = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.id, `${m.number ? m.number + " " : ""}${m.name}`);
    return map;
  }, [members]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function openCreate(parentId = "") {
    setEditing(null);
    setForm({ ...EMPTY, parentId });
    setError(null);
    setNotice(null);
    setPanelOpen(true);
  }

  function openEdit(m: AdminMember) {
    setEditing(m);
    setForm({
      name: m.name,
      spouseName: m.spouseName ?? "",
      number: m.number ?? "",
      parentId: m.parentId ?? "",
      birthInfo: m.birthInfo ?? "",
      bio: m.bio ?? "",
      order: String(m.order),
      isDeceased: m.isDeceased,
      spouseDeceased: m.spouseDeceased,
      avatarUrl: m.avatarUrl ?? "",
      familyPhotoUrl: m.familyPhotoUrl ?? "",
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
    if (!form.name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      spouseName: form.spouseName,
      number: form.number,
      parentId: form.parentId || null,
      birthInfo: form.birthInfo,
      bio: form.bio,
      order: Number(form.order) || 0,
      isDeceased: form.isDeceased,
      spouseDeceased: form.spouseDeceased,
      avatarUrl: form.avatarUrl,
      familyPhotoUrl: form.familyPhotoUrl,
    };
    try {
      const res = editing
        ? await fetch(`/api/members/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setNotice(editing ? "Perubahan tersimpan." : "Anggota ditambahkan.");
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

  async function del(m: AdminMember) {
    if (!window.confirm(`Hapus "${m.name}"?`)) return;
    const res = await fetch(`/api/members/${m.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) {
      setNotice(`"${m.name}" dihapus.`);
      router.refresh();
    } else {
      window.alert(json?.message ?? "Gagal menghapus.");
    }
  }

  async function addGalleryUrl(url: string) {
    if (!editing || !url) return;
    setGalBusy(true);
    try {
      const res = await fetch(`/api/members/${editing.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption: galCaption }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setEditing({ ...editing, photos: [...editing.photos, json.photo] });
        setGalCaption("");
        router.refresh();
      } else {
        window.alert(json?.message ?? "Gagal menambah foto.");
      }
    } finally {
      setGalBusy(false);
    }
  }

  async function delPhoto(pid: string) {
    if (!editing) return;
    const res = await fetch(`/api/photos/${pid}`, { method: "DELETE" });
    if (res.ok) {
      setEditing({ ...editing, photos: editing.photos.filter((p) => p.id !== pid) });
      router.refresh();
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-edge pb-6">
        <BrandMark size="sm" />
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2 px-4 py-2 text-sm font-medium text-primary-deep transition-colors hover:bg-primary/5"
          >
            <IconExternal className="h-4 w-4" /> Lihat Situs
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2 px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-danger/5 hover:text-danger"
          >
            <IconLogout className="h-4 w-4" /> Keluar
          </button>
        </div>
      </header>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-deep">Kelola Anggota</h1>
          <p className="text-sm text-muted">{members.length} anggota terdaftar</p>
        </div>
        <button
          onClick={() => openCreate()}
          className="btn-shine inline-flex items-center gap-2 rounded-full bg-primary-dark px-5 py-2.5 text-sm font-semibold text-on-accent shadow-ambient transition-all hover:bg-primary-deep active:scale-95"
        >
          <IconPlus className="h-4 w-4" /> Tambah Anggota
        </button>
      </div>

      {!storageOn && (
        <p className="mt-4 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2.5 text-xs text-secondary">
          Supabase Storage belum dikonfigurasi — sementara foto hanya bisa lewat URL.
        </p>
      )}
      {dbError && (
        <p className="mt-4 rounded-xl border border-danger/25 bg-danger/5 px-4 py-2.5 text-xs text-danger">
          Database belum tersambung.
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl border border-success/25 bg-success/5 px-4 py-2.5 text-sm text-success">{notice}</p>
      )}

      {/* Form panel */}
      {panelOpen && (
        <section className="mt-6 rounded-2xl border border-gold/25 bg-surface p-6 shadow-ambient-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-primary-deep">
              {editing ? "Edit Anggota" : "Tambah Anggota"}
            </h2>
            <button onClick={close} className="text-muted hover:text-ink" aria-label="Tutup">
              <IconClose className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nama *">
              <input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nama lengkap" />
            </Field>
            <Field label="Pasangan">
              <input className={inp} value={form.spouseName} onChange={(e) => set("spouseName", e.target.value)} placeholder="Nama pasangan (opsional)" />
            </Field>
            <Field label="Nomor silsilah">
              <input className={inp} value={form.number} onChange={(e) => set("number", e.target.value)} placeholder="mis. 3.6.5.1" />
            </Field>
            <Field label="Orang tua">
              <select className={inp} value={form.parentId} onChange={(e) => set("parentId", e.target.value)}>
                <option value="">— Akar (tanpa orang tua) —</option>
                {members
                  .filter((m) => m.id !== editing?.id && !m.marriedIn)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {labelOf.get(m.id)}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Info kelahiran">
              <input className={inp} value={form.birthInfo} onChange={(e) => set("birthInfo", e.target.value)} placeholder="mis. Jakarta, 1990" />
            </Field>
            <Field label="Urutan">
              <input type="number" className={inp} value={form.order} onChange={(e) => set("order", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Bio / catatan">
                <textarea className={`${inp} min-h-24`} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Profil singkat (opsional)" />
              </Field>
            </div>
            <div className="flex items-center gap-5 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={form.isDeceased} onChange={(e) => set("isDeceased", e.target.checked)} /> Almarhum
              </label>
              {form.spouseName && (
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={form.spouseDeceased} onChange={(e) => set("spouseDeceased", e.target.checked)} /> Pasangan almarhumah
                </label>
              )}
            </div>
            <div className="sm:col-span-1">
              <ImageInput label="Foto profil" value={form.avatarUrl} onChange={(v) => set("avatarUrl", v)} folder="avatars" storageOn={storageOn} aspect={1} />
            </div>
            <div className="sm:col-span-1">
              <ImageInput label="Foto keluarga" value={form.familyPhotoUrl} onChange={(v) => set("familyPhotoUrl", v)} folder="family" storageOn={storageOn} aspect={16 / 9} />
            </div>

            {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}

            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary-dark py-3 text-sm font-semibold text-on-accent transition-all hover:bg-primary-deep disabled:opacity-60">
                {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah"}
              </button>
              <button type="button" onClick={close} className="rounded-xl border border-edge px-6 py-3 text-sm font-semibold text-muted hover:bg-surface-2">
                Batal
              </button>
            </div>
          </form>

          {/* Galeri (saat edit) */}
          {editing && (
            <div className="mt-6 border-t border-edge pt-5">
              <h3 className="mb-3 text-sm font-semibold text-ink">Galeri Foto ({editing.photos.length})</h3>
              <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {editing.photos.map((p) => (
                  <div key={p.id} className="group relative overflow-hidden rounded-lg border border-edge">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="aspect-square w-full object-cover" />
                    <button
                      onClick={() => delPhoto(p.id)}
                      className="absolute right-1 top-1 rounded-md bg-danger/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Hapus foto"
                    >
                      <IconTrash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-edge bg-surface-2 p-3">
                <input
                  value={galCaption}
                  onChange={(e) => setGalCaption(e.target.value)}
                  placeholder="Keterangan foto (opsional)"
                  className="w-full rounded-lg border border-edge bg-surface-3 px-3 py-1.5 text-xs text-ink outline-none focus:border-primary-dark"
                />
                <ImageInput label="Tambah foto galeri" value="" onChange={(url) => addGalleryUrl(url)} folder="gallery" storageOn={storageOn} aspect={16 / 9} />
                {galBusy && <p className="text-xs text-muted">Menambah...</p>}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Daftar anggota */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-edge bg-surface shadow-ambient">
        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <IconUsers className="h-8 w-8 text-muted" />
            <p className="text-sm text-muted">Belum ada anggota. Klik &ldquo;Tambah Anggota&rdquo;.</p>
          </div>
        ) : (
          <ul className="divide-y divide-edge">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/[0.03]">
                <span className="w-16 shrink-0 font-mono text-xs text-muted">{m.number ?? "—"}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold text-ink">
                    <span className="truncate">
                      {m.name}
                      {m.spouseName && ` + ${m.spouseName}`}
                      {m.isDeceased && <span className="text-muted"> (alm)</span>}
                    </span>
                    {m.marriedIn && <span className="shrink-0 rounded-full border border-gold/30 bg-gold-soft/20 px-2 py-0.5 text-[10px] font-medium text-secondary">pasangan</span>}
                  </p>
                  {m.parentId && <p className="truncate text-xs text-muted">↳ {labelOf.get(m.parentId)}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {!m.marriedIn && (
                    <button onClick={() => openCreate(m.id)} title="Tambah anak" className="rounded-lg border border-edge p-2 text-primary-deep hover:bg-primary/5">
                      <IconPlus className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => openEdit(m)} title="Edit" className="rounded-lg border border-edge p-2 text-primary-deep hover:bg-primary/5">
                    <IconEdit className="h-4 w-4" />
                  </button>
                  <button onClick={() => del(m)} title="Hapus" className="rounded-lg border border-danger/30 p-2 text-danger hover:bg-danger/5">
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
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
