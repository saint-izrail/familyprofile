"use client";

// Tombol "saran" serbaguna (publik): membuka modal untuk mengirim usulan ke
// /api/submissions sesuai jenis (galeri / foto profil / foto keluarga / bio /
// agenda). Usulan menunggu persetujuan admin, jadi tidak ada perubahan publik
// sampai disetujui (tidak perlu router.refresh).
import { useEffect, useId, useRef, useState } from "react";
import { ImageCropper } from "@/components/image-cropper";
import { useModal, isTopmost } from "@/components/use-modal";
import { IconPhoto, IconUser, IconCalendar, IconClose, IconUpload, IconCheck, IconSparkle } from "@/components/icons";

type Kind = "galeri" | "foto-profil" | "foto-keluarga" | "bio" | "agenda";
type Member = { id: string; number: string | null; name: string; spouseName: string | null };

const PHOTO_KINDS: Kind[] = ["galeri", "foto-profil", "foto-keluarga"];

function isPhotoKind(kind: Kind): boolean {
  return PHOTO_KINDS.includes(kind);
}

function defaultLabel(kind: Kind): string {
  switch (kind) {
    case "galeri":
      return "Kirim Foto";
    case "foto-profil":
      return "Sarankan Foto Profil";
    case "foto-keluarga":
      return "Sarankan Foto Keluarga";
    case "bio":
      return "Sarankan Bio";
    case "agenda":
      return "Usulkan Momen";
  }
}

function modalTitle(kind: Kind): string {
  switch (kind) {
    case "galeri":
      return "Kirim Foto Galeri";
    case "foto-profil":
      return "Sarankan Foto Profil";
    case "foto-keluarga":
      return "Sarankan Foto Keluarga";
    case "bio":
      return "Sarankan Bio";
    case "agenda":
      return "Usulkan Momen";
  }
}

function KindIcon({ kind, className }: { kind: Kind; className?: string }) {
  if (kind === "bio") return <IconUser className={className} />;
  if (kind === "agenda") return <IconCalendar className={className} />;
  return <IconPhoto className={className} />;
}

function memberLabel(m: Member): string {
  return m.spouseName ? `${m.name} & ${m.spouseName}` : m.name;
}

export function SuggestButton({
  kind,
  memberId,
  label,
  members,
}: {
  kind: Kind;
  memberId?: string;
  label?: string;
  members?: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Field foto
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");

  // Field bio
  const [bio, setBio] = useState("");

  // Field agenda
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("acara");
  const [recurring, setRecurring] = useState(false);
  const [description, setDescription] = useState("");
  const [linkedMemberId, setLinkedMemberId] = useState("");

  // Umum
  const [submittedBy, setSubmittedBy] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Kunci scroll + perangkap fokus + kembalikan fokus ke pemicu.
  const modalToken = useModal(open, dialogRef);

  const titleId = useId();
  const errId = useId();
  const senderId = useId();
  const captionId = useId();
  const bioId = useId();
  const agendaTitleId = useId();
  const agendaDateId = useId();
  const agendaTypeId = useId();
  const agendaRecurringId = useId();
  const agendaDescId = useId();
  const agendaMemberId = useId();

  const photo = isPhotoKind(kind);
  const showMemberSelect = kind === "agenda" && !memberId && !!members && members.length > 0;

  // Bersihkan object URL pratinjau.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  // Fokus tombol tutup HANYA saat modal pertama terbuka (bukan tiap cropFile
  // berubah) agar fokus tak tercabut setelah cropper ditutup.
  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  // Tutup dengan Escape — hanya bila modal ini teratas & cropper tak aktif.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !cropFile && isTopmost(modalToken)) close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, cropFile, modalToken]);

  function resetFields() {
    setErr(null);
    setBusy(false);
    setCropFile(null);
    setBlob(null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setCaption("");
    setBio("");
    setTitle("");
    setDate("");
    setType("acara");
    setRecurring(false);
    setDescription("");
    setLinkedMemberId("");
    setSubmittedBy("");
  }

  function openModal() {
    resetFields();
    setDone(false);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setCropFile(null);
  }

  // Kirim usulan lain tanpa menutup modal — pertahankan nama pengirim.
  function sendAnother() {
    const keepSender = submittedBy;
    resetFields();
    setSubmittedBy(keepSender);
    setDone(false);
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset agar memilih file yang sama lagi tetap memicu onChange.
    e.target.value = "";
    if (file) {
      setErr(null);
      setCropFile(file);
    }
  }

  function onCropDone(b: Blob) {
    setCropFile(null);
    setBlob(b);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(b);
    });
  }

  function clearPhoto() {
    setBlob(null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const sender = submittedBy.trim();
    if (!sender) {
      setErr("Isi nama kamu terlebih dahulu.");
      return;
    }

    let request: { method: string; body: BodyInit; headers?: HeadersInit };

    if (photo) {
      if (!blob) {
        setErr("Pilih dan pangkas foto terlebih dahulu.");
        return;
      }
      const fd = new FormData();
      fd.append("kind", kind);
      if (memberId) fd.append("memberId", memberId);
      fd.append("file", blob, "photo.jpg");
      if (kind === "galeri") fd.append("caption", caption.trim());
      fd.append("submittedBy", sender);
      request = { method: "POST", body: fd };
    } else if (kind === "bio") {
      const trimmedBio = bio.trim();
      if (!trimmedBio) {
        setErr("Tuliskan bio terlebih dahulu.");
        return;
      }
      request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, memberId, bio: trimmedBio, submittedBy: sender }),
      };
    } else {
      // agenda
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setErr("Isi judul momen terlebih dahulu.");
        return;
      }
      if (!date) {
        setErr("Pilih tanggal terlebih dahulu.");
        return;
      }
      const linked = memberId ?? (linkedMemberId || undefined);
      request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title: trimmedTitle,
          date,
          type,
          recurring,
          description: description.trim(),
          memberId: linked,
          submittedBy: sender,
        }),
      };
    }

    setBusy(true);
    try {
      const res = await fetch("/api/submissions", request);
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setDone(true);
      } else {
        setErr(json?.message ?? "Gagal mengirim usulan. Coba lagi.");
      }
    } catch {
      setErr("Gagal mengirim usulan. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-edge-strong bg-surface-2 px-4 py-3 text-sm text-ink shadow-ambient transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
  const labelClass =
    "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary";
  const optionalSpan = (
    <span className="font-normal normal-case tracking-normal text-muted">(opsional)</span>
  );

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="hover-lift inline-flex items-center gap-2 rounded-full border border-edge bg-surface-2 px-4 py-2 text-sm font-semibold text-primary-deep shadow-ambient transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <KindIcon kind={kind} className="h-4 w-4" />
        {label ?? defaultLabel(kind)}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4 backdrop-blur"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !cropFile) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-edge bg-surface-3 p-5 shadow-ambient-lg"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3
                id={titleId}
                className="flex items-center gap-2 font-serif text-base font-bold text-primary-deep"
              >
                <KindIcon kind={kind} className="h-5 w-5 text-primary" />
                {modalTitle(kind)}
              </h3>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={close}
                aria-label="Tutup"
                className="text-muted transition-colors hover:text-ink"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <div className="py-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconCheck className="h-7 w-7" />
                </div>
                <p className="mx-auto mt-4 max-w-xs text-sm text-ink">
                  Terkirim! Usulanmu menunggu persetujuan admin dan akan tampil setelah disetujui.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="ring-glow inline-flex items-center justify-center gap-2 rounded-xl bg-primary-dark px-6 py-2.5 text-sm font-semibold text-on-accent shadow-ambient transition-opacity"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={sendAnother}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-edge px-5 py-2.5 text-sm font-semibold text-primary-deep transition-colors hover:bg-primary/5"
                  >
                    <IconSparkle className="h-4 w-4" />
                    Kirim lagi
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {/* ---- Foto (galeri / foto-profil / foto-keluarga) ---- */}
                {photo && (
                  <div className="flex flex-col gap-1.5">
                    <span className={labelClass}>
                      <IconPhoto className="h-3.5 w-3.5" />
                      Foto
                    </span>

                    {preview ? (
                      <div className="relative overflow-hidden rounded-2xl border border-edge bg-surface-2 shadow-ambient">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt="Pratinjau foto yang akan dikirim"
                          className={`w-full object-cover ${kind === "foto-profil" ? "aspect-square" : "aspect-video"}`}
                        />
                        <button
                          type="button"
                          onClick={clearPhoto}
                          aria-label="Hapus foto"
                          className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-surface/90 text-muted shadow-ambient backdrop-blur transition-colors hover:text-danger"
                        >
                          <IconClose className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`hover-lift flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-edge-strong bg-surface-2 text-muted transition-colors hover:border-primary/50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${kind === "foto-profil" ? "aspect-square" : "aspect-video"}`}
                      >
                        <IconUpload className="h-7 w-7" />
                        <span className="text-sm font-semibold">Pilih foto</span>
                        <span className="text-[11px] text-muted">
                          Akan dipangkas ke rasio {kind === "foto-profil" ? "1:1" : "16:9"}
                        </span>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onPickFile}
                      className="sr-only"
                      aria-label="Pilih berkas foto"
                    />

                    {preview && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg border border-edge-strong bg-surface-2 px-3 py-1.5 text-xs font-semibold text-primary-deep transition-colors hover:bg-primary/5"
                      >
                        <IconUpload className="h-3.5 w-3.5" />
                        Ganti foto
                      </button>
                    )}
                  </div>
                )}

                {/* Keterangan (galeri saja) */}
                {kind === "galeri" && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={captionId} className={labelClass}>
                      <IconPhoto className="h-3.5 w-3.5" />
                      Keterangan {optionalSpan}
                    </label>
                    <input
                      id={captionId}
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Mis. Acara halal bihalal 2024"
                      className={fieldClass}
                    />
                  </div>
                )}

                {/* ---- Bio ---- */}
                {kind === "bio" && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={bioId} className={labelClass}>
                      <IconUser className="h-3.5 w-3.5" />
                      Bio
                    </label>
                    <textarea
                      id={bioId}
                      required
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={5}
                      placeholder="Tuliskan bio singkat anggota ini…"
                      className={`${fieldClass} resize-y`}
                    />
                  </div>
                )}

                {/* ---- Agenda ---- */}
                {kind === "agenda" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={agendaTitleId} className={labelClass}>
                        <IconCalendar className="h-3.5 w-3.5" />
                        Judul
                      </label>
                      <input
                        id={agendaTitleId}
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Mis. Ulang tahun pernikahan"
                        className={fieldClass}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={agendaDateId} className={labelClass}>
                        <IconCalendar className="h-3.5 w-3.5" />
                        Tanggal
                      </label>
                      <input
                        id={agendaDateId}
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={fieldClass}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={agendaTypeId} className={labelClass}>
                        <IconSparkle className="h-3.5 w-3.5" />
                        Jenis
                      </label>
                      <select
                        id={agendaTypeId}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={`${fieldClass} appearance-none`}
                      >
                        <option value="ulang-tahun">Ulang tahun</option>
                        <option value="acara">Acara</option>
                        <option value="rencana">Rencana</option>
                      </select>
                    </div>

                    <label
                      htmlFor={agendaRecurringId}
                      className="flex items-center gap-2.5 text-sm text-ink"
                    >
                      <input
                        id={agendaRecurringId}
                        type="checkbox"
                        checked={recurring}
                        onChange={(e) => setRecurring(e.target.checked)}
                        className="h-4 w-4 rounded border-edge-strong accent-primary"
                      />
                      Berulang tiap tahun
                    </label>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={agendaDescId} className={labelClass}>
                        <IconCalendar className="h-3.5 w-3.5" />
                        Deskripsi {optionalSpan}
                      </label>
                      <textarea
                        id={agendaDescId}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Catatan tambahan…"
                        className={`${fieldClass} resize-y`}
                      />
                    </div>

                    {showMemberSelect && (
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor={agendaMemberId} className={labelClass}>
                          <IconUser className="h-3.5 w-3.5" />
                          Anggota terkait {optionalSpan}
                        </label>
                        <select
                          id={agendaMemberId}
                          value={linkedMemberId}
                          onChange={(e) => setLinkedMemberId(e.target.value)}
                          className={`${fieldClass} appearance-none`}
                        >
                          <option value="">Tidak terkait anggota</option>
                          {members!.map((m) => (
                            <option key={m.id} value={m.id}>
                              {memberLabel(m)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* ---- Nama kamu (umum) ---- */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={senderId} className={labelClass}>
                    <IconUser className="h-3.5 w-3.5" />
                    Nama kamu
                  </label>
                  <input
                    id={senderId}
                    type="text"
                    required
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    placeholder="Nama kamu"
                    autoComplete="name"
                    className={fieldClass}
                  />
                </div>

                {err && (
                  <p id={errId} role="alert" className="text-sm font-medium text-danger">
                    {err}
                  </p>
                )}

                <div className="mt-1 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-xl border border-edge px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    aria-describedby={err ? errId : undefined}
                    className="btn-shine ring-glow inline-flex items-center justify-center gap-2 rounded-xl bg-primary-dark px-6 py-2.5 text-sm font-semibold text-on-accent shadow-ambient transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconSparkle className="h-4 w-4" />
                    {busy ? "Mengirim…" : "Kirim Usulan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {cropFile && (
        <ImageCropper
          file={cropFile}
          aspect={kind === "foto-profil" ? 1 : 16 / 9}
          onDone={onCropDone}
          onCancel={() => setCropFile(null)}
        />
      )}
    </>
  );
}
