"use client";

// Pohon silsilah interaktif.
// - Garis keturunan menyambung ke anggota keturunan (kotak kiri); pasangan
//   menempel di kanan lewat tautan pernikahan (♥ -> halaman keluarga).
// - Tap kartu -> profil individu; seret -> geser; cubit/scroll/tombol -> zoom.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TreeMember } from "@/lib/members";
import { initials } from "@/lib/format";
import { IconZoomIn, IconZoomOut, IconExpand, IconSearch, IconClose, IconHeart } from "@/components/icons";

const MIN = 0.2;
const MAX = 2.8;
const SPOUSE_RESERVE = 232;
const clamp = (v: number, min = MIN, max = MAX) => Math.min(max, Math.max(min, v));

type Flat = { id: string; number: string | null; name: string; partnerName: string | null };
function flatten(nodes: TreeMember[], out: Flat[] = []): Flat[] {
  for (const n of nodes) {
    out.push({ id: n.id, number: n.number, name: n.name, partnerName: n.partner?.name ?? null });
    flatten(n.children, out);
  }
  return out;
}

function Avatar({ name, url, size = "h-11 w-11" }: { name: string; url: string | null; size?: string }) {
  return (
    <span className={`flex ${size} items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-primary/10 text-sm font-semibold text-primary`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function FamilyTree({ roots }: { roots: TreeMember[] }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [fs, setFs] = useState(false);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDist = useRef<number | null>(null);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const capturing = useRef(false);
  const dragged = useRef(false);

  const flat = useMemo(() => flatten(roots), [roots]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return flat
      .filter((m) => m.name.toLowerCase().includes(q) || (m.partnerName ?? "").toLowerCase().includes(q) || (m.number ?? "").includes(q))
      .slice(0, 8);
  }, [query, flat]);

  // Navigasi hanya bila bukan hasil seret.
  const go = useCallback(
    (href: string) => {
      if (dragged.current) return;
      router.push(href);
    },
    [router],
  );

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setScale((s) => {
      const ns = clamp(s * factor);
      setTx((t) => cx - (cx - t) * (ns / s));
      setTy((t) => cy - (cy - t) * (ns / s));
      return ns;
    });
  }, []);

  const btnZoom = useCallback(
    (factor: number) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setAnimating(true);
      zoomAt(factor, r.width / 2, r.height / 2);
      window.setTimeout(() => setAnimating(false), 320);
    },
    [zoomAt],
  );

  const reset = useCallback(() => {
    setAnimating(true);
    setScale(0.8);
    setTx(0);
    setTy(0);
    setHighlightId(null);
    window.setTimeout(() => setAnimating(false), 420);
  }, []);

  const focusNode = useCallback((id: string) => {
    const wrap = wrapRef.current;
    const node = wrap?.querySelector<HTMLElement>(`[data-mid="${id}"]`);
    if (!wrap || !node) return;
    const wr = wrap.getBoundingClientRect();
    const nr = node.getBoundingClientRect();
    const dx = wr.left + wr.width / 2 - (nr.left + nr.width / 2);
    const dy = wr.top + wr.height / 2 - (nr.top + nr.height / 2);
    setAnimating(true);
    setTx((t) => t + dx);
    setTy((t) => t + dy);
    setHighlightId(id);
    window.setTimeout(() => setAnimating(false), 480);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const onFs = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  function toggleFullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  }

  function onPointerDown(e: React.PointerEvent) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragged.current = false;
    capturing.current = false;
    if (pointers.current.size === 1) {
      dragStart.current = { x: e.clientX, y: e.clientY, tx, ty };
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      pinchDist.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      dragStart.current = null;
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchDist.current != null) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const el = wrapRef.current;
      if (el && dist > 0) {
        const r = el.getBoundingClientRect();
        zoomAt(dist / pinchDist.current, (pts[0].x + pts[1].x) / 2 - r.left, (pts[0].y + pts[1].y) / 2 - r.top);
        pinchDist.current = dist;
      }
      dragged.current = true;
      return;
    }

    if (dragStart.current) {
      const ddx = e.clientX - dragStart.current.x;
      const ddy = e.clientY - dragStart.current.y;
      if (!capturing.current && Math.hypot(ddx, ddy) > 5) {
        capturing.current = true;
        dragged.current = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      }
      if (capturing.current) {
        setTx(dragStart.current.tx + ddx);
        setTy(dragStart.current.ty + ddy);
      }
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    if (pointers.current.size < 2) pinchDist.current = null;
    if (pointers.current.size === 0) {
      dragStart.current = null;
      capturing.current = false;
    } else if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()];
      dragStart.current = { x: p.x, y: p.y, tx, ty };
    }
  }

  const ctlCls =
    "flex h-10 w-10 items-center justify-center rounded-xl border border-edge bg-surface-3 text-primary-deep shadow-ambient transition-all hover:border-gold/40 hover:text-primary active:scale-95";

  const renderNode = (m: TreeMember) => (
    <li key={m.id} style={{ marginRight: m.partner ? SPOUSE_RESERVE : undefined }}>
      <div className="relative inline-block">
        {/* Kartu keturunan (anchor garis) */}
        <button
          type="button"
          data-mid={m.id}
          onClick={() => go(`/anggota/${m.id}`)}
          className={`group flex w-[200px] flex-col items-center gap-2 rounded-2xl border bg-surface-3 px-4 py-4 text-center transition-all hover:-translate-y-0.5 ${
            highlightId === m.id ? "border-gold ring-2 ring-gold glow-primary" : "border-edge shadow-ambient hover:border-gold/45 hover:shadow-ambient-lg"
          }`}
        >
          <Avatar name={m.name} url={m.avatarUrl} />
          <span className="text-sm font-semibold leading-tight text-ink">
            {m.name}
            {m.isDeceased && <span className="font-normal text-muted"> (alm)</span>}
          </span>
          {m.number && <span className="text-[10px] font-semibold tracking-wider text-secondary">{m.number}</span>}
        </button>

        {/* Pasangan menempel di kanan */}
        {m.partner && (
          <div className="absolute left-full top-1/2 z-[1] flex -translate-y-1/2 items-center">
            <span aria-hidden className="h-px w-2 bg-gold/50" />
            <button
              type="button"
              onClick={() => go(`/keluarga/${m.id}`)}
              title="Profil keluarga"
              aria-label={`Profil keluarga ${m.name}`}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-surface-3 text-secondary shadow-ambient transition-colors hover:bg-gold/10"
            >
              <IconHeart className="h-3.5 w-3.5" />
            </button>
            <span aria-hidden className="h-px w-2 bg-gold/50" />
            <button
              type="button"
              onClick={() => go(`/anggota/${m.partner!.id}`)}
              className="group flex w-[176px] flex-col items-center gap-1.5 rounded-2xl border border-dashed border-edge-strong bg-surface-2 px-3 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-gold/45"
            >
              <Avatar name={m.partner.name} url={m.partner.avatarUrl} size="h-9 w-9" />
              <span className="text-xs font-semibold leading-tight text-ink">
                {m.partner.name}
                {m.partner.isDeceased && <span className="font-normal text-muted"> (alm)</span>}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted">pasangan</span>
            </button>
          </div>
        )}
      </div>
      {m.children.length > 0 && <ul>{m.children.map(renderNode)}</ul>}
    </li>
  );

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative w-full touch-none overflow-hidden border border-edge bg-surface/50 ring-glow ${
          fs ? "h-screen rounded-none" : "h-[74vh] min-h-[460px] rounded-3xl"
        }`}
        style={{ touchAction: "none" }}
      >
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="absolute left-1/2 top-12 will-change-transform"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: "0 0",
            transition: animating ? "transform 0.45s cubic-bezier(0.2,0.7,0.2,1)" : "none",
          }}
        >
          <div className="-translate-x-1/2">
            <div className="familytree">
              <ul>{roots.map(renderNode)}</ul>
            </div>
          </div>
        </div>

        {/* Pencarian fokus */}
        <div className="absolute left-4 top-4 w-[min(78vw,260px)]">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <IconSearch className="h-4 w-4" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari & fokus anggota…"
              aria-label="Cari anggota di pohon"
              className="w-full rounded-xl border border-edge bg-surface-3/90 py-2.5 pl-9 pr-8 text-sm text-ink shadow-ambient outline-none backdrop-blur focus:border-primary-dark"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Bersihkan">
                <IconClose className="h-4 w-4" />
              </button>
            )}
          </div>
          {matches.length > 0 && (
            <ul className="mt-2 overflow-hidden rounded-xl border border-edge bg-surface-3 shadow-ambient-lg">
              {matches.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      focusNode(m.id);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10"
                  >
                    <span className="truncate font-medium text-ink">
                      {m.name}
                      {m.partnerName && ` & ${m.partnerName}`}
                    </span>
                    {m.number && <span className="ml-auto shrink-0 text-[10px] text-secondary">{m.number}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Kontrol */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button type="button" onClick={() => btnZoom(1.25)} aria-label="Perbesar" className={ctlCls}>
            <IconZoomIn className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => btnZoom(0.8)} aria-label="Perkecil" className={ctlCls}>
            <IconZoomOut className="h-5 w-5" />
          </button>
          <button type="button" onClick={reset} aria-label="Atur ulang" className={ctlCls}>
            <IconExpand className="h-5 w-5" />
          </button>
          <button type="button" onClick={toggleFullscreen} aria-label={fs ? "Keluar layar penuh" : "Layar penuh"} className={ctlCls}>
            {fs ? <IconClose className="h-5 w-5" /> : <IconExpand className="h-5 w-5 rotate-45" />}
          </button>
        </div>

        <p className="absolute bottom-4 left-4 rounded-full border border-edge bg-surface/70 px-3 py-1 text-[11px] text-muted backdrop-blur">
          Ketuk kartu untuk profil · seret untuk geser · cubit / scroll untuk zoom
        </p>
      </div>
    </div>
  );
}
