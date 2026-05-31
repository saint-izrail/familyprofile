"use client";

// Pemotong foto (crop) interaktif: geser + zoom di dalam bingkai beraspek
// tertentu, lalu hasil crop diekspor sebagai Blob JPEG. Tanpa dependency.
import { useCallback, useEffect, useRef, useState } from "react";
import { useModal, isTopmost } from "@/components/use-modal";
import { IconClose, IconZoomIn, IconZoomOut } from "@/components/icons";

export function ImageCropper({
  file,
  aspect,
  onDone,
  onCancel,
}: {
  file: File;
  aspect: number;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [src, setSrc] = useState("");
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [frameW, setFrameW] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [busy, setBusy] = useState(false);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Kunci scroll + perangkap fokus + kembalikan fokus ke pemicu (modal teratas).
  const modalToken = useModal(true, dialogRef);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setSrc(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  // Escape untuk membatalkan (hanya bila cropper modal teratas).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isTopmost(modalToken)) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, modalToken]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const upd = () => setFrameW(el.clientWidth);
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frameH = frameW / aspect;
  const baseCover = nat && frameW ? Math.max(frameW / nat.w, frameH / nat.h) : 1;
  const dispW = nat ? nat.w * baseCover * zoom : 0;
  const dispH = nat ? nat.h * baseCover * zoom : 0;

  const clamp = useCallback(
    (x: number, y: number) => ({
      x: Math.min(0, Math.max(frameW - dispW, x)),
      y: Math.min(0, Math.max(frameH - dispH, y)),
    }),
    [frameW, frameH, dispW, dispH],
  );

  // Pusatkan saat gambar/bingkai siap.
  useEffect(() => {
    if (!nat || !frameW) return;
    setTx(Math.min(0, (frameW - dispW) / 2));
    setTy(Math.min(0, (frameH - dispH) / 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nat, frameW]);

  // Clamp ulang saat zoom berubah agar gambar tetap menutupi bingkai.
  useEffect(() => {
    setTx((x) => Math.min(0, Math.max(frameW - dispW, x)));
    setTy((y) => Math.min(0, Math.max(frameH - dispH, y)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const im = e.currentTarget;
    setNat({ w: im.naturalWidth, h: im.naturalHeight });
  }

  function onDown(e: React.PointerEvent) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a!.x - b!.x, a!.y - b!.y) || 1, zoom };
      drag.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY, tx, ty };
    }
  }
  function onMove(e: React.PointerEvent) {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // Dua jari -> cubit untuk zoom.
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      setZoom(Math.min(3, Math.max(1, pinch.current.zoom * (dist / pinch.current.dist))));
      return;
    }
    if (!drag.current) return;
    const c = clamp(drag.current.tx + (e.clientX - drag.current.x), drag.current.ty + (e.clientY - drag.current.y));
    setTx(c.x);
    setTy(c.y);
  }
  function onUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }

  // Geser dengan panah keyboard; +/- untuk zoom (aksesibilitas).
  function onFrameKey(e: React.KeyboardEvent) {
    const step = 24;
    if (e.key === "ArrowLeft") { e.preventDefault(); const c = clamp(tx - step, ty); setTx(c.x); setTy(c.y); }
    else if (e.key === "ArrowRight") { e.preventDefault(); const c = clamp(tx + step, ty); setTx(c.x); setTy(c.y); }
    else if (e.key === "ArrowUp") { e.preventDefault(); const c = clamp(tx, ty - step); setTx(c.x); setTy(c.y); }
    else if (e.key === "ArrowDown") { e.preventDefault(); const c = clamp(tx, ty + step); setTx(c.x); setTy(c.y); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoom((z) => Math.min(3, z + 0.2)); }
    else if (e.key === "-") { e.preventDefault(); setZoom((z) => Math.max(1, z - 0.2)); }
  }

  function crop() {
    const img = imgRef.current;
    if (!img || !nat) return;
    setBusy(true);
    const scale = baseCover * zoom;
    const sx = -tx / scale;
    const sy = -ty / scale;
    const sw = frameW / scale;
    const sh = frameH / scale;
    const targetW = Math.min(1280, Math.max(1, Math.round(sw)));
    const targetH = Math.round(targetW / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
    canvas.toBlob(
      (b) => {
        setBusy(false);
        if (b) onDone(b);
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Sesuaikan foto">
      <div ref={dialogRef} className="max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-edge bg-surface-3 p-5 shadow-ambient-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-primary-deep">Sesuaikan Foto</h3>
          <button type="button" onClick={onCancel} aria-label="Tutup" className="text-muted hover:text-ink">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={frameRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onFrameKey}
          tabIndex={0}
          role="application"
          aria-label="Area pemotongan foto — seret atau gunakan panah untuk menggeser, +/- untuk zoom"
          className="relative w-full cursor-grab touch-none overflow-hidden rounded-xl border border-edge bg-black/40 active:cursor-grabbing"
          style={{ aspectRatio: String(aspect) }}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={onImgLoad}
              className="absolute select-none"
              style={{ left: tx, top: ty, width: dispW || undefined, height: dispH || undefined, maxWidth: "none" }}
            />
          )}
          <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />
        </div>

        <p className="mt-2 text-center text-[11px] text-muted">Seret / cubit untuk geser &amp; zoom · slider atau panah keyboard</p>
        <div className="mt-2 flex items-center gap-3">
          <IconZoomOut className="h-4 w-4 shrink-0 text-muted" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer accent-primary"
            aria-label="Zoom"
          />
          <IconZoomIn className="h-4 w-4 shrink-0 text-muted" />
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-edge px-5 py-2.5 text-sm font-semibold text-muted hover:bg-surface-2">
            Batal
          </button>
          <button type="button" onClick={crop} disabled={busy || !nat} className="flex-1 rounded-xl bg-primary-dark py-2.5 text-sm font-semibold text-on-accent transition-all hover:bg-primary-deep disabled:opacity-60">
            {busy ? "Memproses…" : "Pakai Foto Ini"}
          </button>
        </div>
      </div>
    </div>
  );
}
