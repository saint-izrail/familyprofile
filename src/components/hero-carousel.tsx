"use client";

// Carousel foto beranda: auto-geser tiap ~4.5 detik (fade), titik navigasi,
// dan tombol prev/next. Menghormati prefers-reduced-motion (tidak auto-geser),
// jeda saat hover/fokus, dan kontrol muncul saat difokus keyboard.
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";

export function HeroCarousel({ photos }: { photos: { url: string; caption: string | null }[] }) {
  const n = photos.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (n <= 1 || paused) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % n), 4500);
    return () => window.clearInterval(t);
  }, [n, paused]);

  const ctrl =
    "opacity-0 transition-opacity hover:bg-black/50 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100";

  return (
    <figure
      className="group relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-gold/25 bg-surface ring-glow"
      aria-roledescription="carousel"
      aria-label="Foto keluarga besar"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      {photos.map((p, idx) => (
        <Image
          key={idx}
          src={p.url}
          alt={p.caption ?? "Foto keluarga"}
          fill
          priority={idx === 0}
          sizes="(max-width: 896px) 100vw, 896px"
          className={`object-cover transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

      {photos[i]?.caption && (
        <figcaption
          aria-live="polite"
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-5 pb-4 pt-10 text-left text-sm font-medium text-white"
        >
          {photos[i].caption}
        </figcaption>
      )}

      {n > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Sebelumnya"
            className={`absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur ${ctrl}`}
          >
            <IconArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Berikutnya"
            className={`absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur ${ctrl}`}
          >
            <IconArrowRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Ke foto ${idx + 1}`}
                aria-current={idx === i ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white ${idx === i ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </figure>
  );
}
