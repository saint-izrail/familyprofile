"use client";

// Galeri foto dengan lightbox: klik thumbnail -> tampilan penuh + navigasi.
import { useCallback, useEffect, useState } from "react";
import { IconClose, IconArrowLeft, IconArrowRight } from "@/components/icons";

type Photo = { id: string; url: string; caption: string | null };

export function PhotoLightbox({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: number) => setOpen((i) => (i === null ? null : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, go]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpen(i)}
            className="group overflow-hidden rounded-2xl border border-edge bg-surface-2 text-left transition-all hover:border-gold/40 hover:shadow-ambient"
            aria-label={`Buka foto ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption ?? ""} className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
            {p.caption && <span className="block px-3 py-1.5 text-center text-[11px] text-muted">{p.caption}</span>}
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Tutup"
          >
            <IconClose className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 md:left-8"
                aria-label="Sebelumnya"
              >
                <IconArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 md:right-8"
                aria-label="Berikutnya"
              >
                <IconArrowRight className="h-5 w-5" />
              </button>
            </>
          )}

          <figure className="flex max-h-full max-w-4xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[open].url} alt={photos[open].caption ?? ""} className="max-h-[80vh] w-auto rounded-2xl border border-white/15 object-contain shadow-2xl" />
            {photos[open].caption && <figcaption className="text-sm text-white/80">{photos[open].caption}</figcaption>}
            <p className="text-xs text-white/50">{open + 1} / {photos.length}</p>
          </figure>
        </div>
      )}
    </>
  );
}
