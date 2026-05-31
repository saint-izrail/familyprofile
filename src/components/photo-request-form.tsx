"use client";

// Formulir kirim foto mandiri (publik). Pilih anggota, pangkas foto (16:9),
// lalu kirim ke /api/submissions (kind=galeri) untuk menunggu persetujuan admin.
import { useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageCropper } from "@/components/image-cropper";
import { Reveal } from "@/components/reveal";
import { IconUpload, IconPhoto, IconUser, IconSparkle, IconClose, IconHeart } from "@/components/icons";

type Member = { id: string; number: string | null; name: string; spouseName: string | null };

function memberLabel(m: Member): string {
  return m.spouseName ? `${m.name} & ${m.spouseName}` : m.name;
}

export function PhotoRequestForm({ members }: { members: Member[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pra-pilih anggota lewat ?member=<id> bila valid (hanya saat mount).
  const [memberId, setMemberId] = useState(() => {
    const pre = searchParams.get("member");
    return pre && members.some((m) => m.id === pre) ? pre : "";
  });
  const [submittedBy, setSubmittedBy] = useState("");
  const [caption, setCaption] = useState("");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const memberLabelId = useId();
  const senderId = useId();
  const captionFieldId = useId();
  const errId = useId();

  // Bersihkan object URL pratinjau saat berubah / unmount.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

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
    if (!memberId) {
      setErr("Pilih anggota tujuan terlebih dahulu.");
      return;
    }
    if (!blob) {
      setErr("Pilih dan pangkas foto terlebih dahulu.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("kind", "galeri");
      fd.append("file", blob, "photo.jpg");
      fd.append("memberId", memberId);
      fd.append("caption", caption.trim());
      fd.append("submittedBy", submittedBy.trim());
      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setDone(true);
        router.refresh();
      } else {
        setErr(json?.message ?? "Gagal mengirim foto. Coba lagi.");
      }
    } catch {
      setErr("Gagal mengirim foto. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  function sendAnother() {
    setDone(false);
    setCaption("");
    setSubmittedBy("");
    clearPhoto();
    // Pertahankan anggota terpilih untuk kemudahan pengiriman beruntun.
  }

  const fieldClass =
    "w-full rounded-xl border border-edge-strong bg-surface-2 px-4 py-3 text-sm text-ink shadow-ambient transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (done) {
    return (
      <Reveal>
        <section className="ring-glow rounded-3xl border border-gold/30 bg-surface p-8 text-center shadow-ambient backdrop-blur-xl md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconHeart className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-serif text-2xl font-extrabold">
            <span className="gold-text">Terima kasih!</span>
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
            Foto kamu menunggu persetujuan admin. Setelah disetujui, foto akan
            tampil di halaman anggota.
          </p>
          <button
            type="button"
            onClick={sendAnother}
            className="btn-shine ring-glow mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-dark px-6 py-3 text-sm font-semibold text-on-accent shadow-ambient-lg transition-opacity"
          >
            <IconUpload className="h-4 w-4" />
            Kirim Foto Lain
          </button>
        </section>
      </Reveal>
    );
  }

  return (
    <section className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient backdrop-blur-xl md:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* Untuk anggota */}
        <div className="flex flex-col gap-1.5">
          <label
            id={memberLabelId}
            htmlFor="photo-member"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary"
          >
            <IconUser className="h-3.5 w-3.5" />
            Untuk anggota
          </label>
          <select
            id="photo-member"
            aria-labelledby={memberLabelId}
            required
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className={`${fieldClass} appearance-none`}
          >
            <option value="">Pilih anggota…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {memberLabel(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Nama pengirim */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={senderId}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary"
          >
            <IconUser className="h-3.5 w-3.5" />
            Nama pengirim
            <span className="font-normal normal-case tracking-normal text-muted">(opsional)</span>
          </label>
          <input
            id={senderId}
            type="text"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            placeholder="Nama kamu"
            autoComplete="name"
            className={fieldClass}
          />
        </div>

        {/* Keterangan / caption */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={captionFieldId}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary"
          >
            <IconPhoto className="h-3.5 w-3.5" />
            Keterangan
            <span className="font-normal normal-case tracking-normal text-muted">(opsional)</span>
          </label>
          <input
            id={captionFieldId}
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Mis. Acara halal bihalal 2024"
            className={fieldClass}
          />
        </div>

        {/* Foto picker */}
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            <IconPhoto className="h-3.5 w-3.5" />
            Foto
          </span>

          {preview ? (
            <div className="relative overflow-hidden rounded-2xl border border-edge bg-surface-2 shadow-ambient">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Pratinjau foto yang akan dikirim"
                className="aspect-video w-full object-cover"
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
              className="hover-lift flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-edge-strong bg-surface-2 text-muted transition-colors hover:border-primary/50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <IconUpload className="h-7 w-7" />
              <span className="text-sm font-semibold">Pilih foto</span>
              <span className="text-[11px] text-muted">Akan dipangkas ke rasio 16:9</span>
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

        {err && (
          <p id={errId} role="alert" className="text-sm font-medium text-danger">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          aria-describedby={err ? errId : undefined}
          className="btn-shine ring-glow inline-flex items-center justify-center gap-2 self-center rounded-xl bg-primary-dark px-6 py-3 text-sm font-semibold text-on-accent shadow-ambient-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconSparkle className="h-4 w-4" />
          {busy ? "Mengirim…" : "Kirim Foto"}
        </button>
      </form>

      {cropFile && (
        <ImageCropper
          file={cropFile}
          aspect={16 / 9}
          onDone={onCropDone}
          onCancel={() => setCropFile(null)}
        />
      )}
    </section>
  );
}
