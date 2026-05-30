"use client";

// Pohon silsilah interaktif: tampil seluruhnya, zoom & geser (pan), pinch di
// layar sentuh, pencarian-fokus (klik hasil -> tengahkan & sorot), serta
// mode layar penuh.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { TreeMember } from "@/lib/members";
import { initials } from "@/lib/format";
import { IconZoomIn, IconZoomOut, IconExpand, IconSearch, IconClose } from "@/components/icons";

const MIN = 0.2;
const MAX = 2.8;
const clamp = (v: number, min = MIN, max = MAX) => Math.min(max, Math.max(min, v));

type Flat = { id: string; number: string | null; name: string; spouseName: string | null };
function flatten(nodes: TreeMember[], out: Flat[] = []): Flat[] {
  for (const n of nodes) {
    out.push({ id: n.id, number: n.number, name: n.name, spouseName: n.spouseName });
    flatten(n.children, out);
  }
  return out;
}

function NodeCard({ m, highlight }: { m: TreeMember; highlight: boolean }) {
  return (
    <Link
      href={`/anggota/${m.id}`}
      data-mid={m.id}
      className={`group inline-flex w-[200px] flex-col items-center gap-2 rounded-2xl border bg-surface-3 px-4 py-4 text-center transition-all hover:-translate-y-0.5 ${
        highlight
          ? "border-gold ring-2 ring-gold glow-primary"
          : "border-edge shadow-ambient hover:border-gold/45 hover:shadow-ambient-lg"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-primary/10 text-sm font-semibold text-primary">
        {m.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(m.name)
        )}
      </span>
      <div>
        <p className="text-sm font-semibold leading-tight text-ink">
          {m.name}
          {m.isDeceased && <span className="font-normal text-muted"> (alm)</span>}
        </p>
        {m.spouseName && (
          <p className="text-xs text-muted">
            &amp; {m.spouseName}
            {m.spouseDeceased && " (almh)"}
          </p>
        )}
        {m.number && (
          <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-secondary">{m.number}</p>
        )}
      </div>
    </Link>
  );
}

function TreeNode({ m, highlightId }: { m: TreeMember; highlightId: string | null }) {
  return (
    <li>
      <NodeCard m={m} highlight={highlightId === m.id} />
      {m.children.length > 0 && (
        <ul>
          {m.children.map((c) => (
            <TreeNode key={c.id} m={c} highlightId={highlightId} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FamilyTree({ roots }: { roots: TreeMember[] }) {
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

  const flat = useMemo(() => flatten(roots), [roots]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return flat
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.spouseName ?? "").toLowerCase().includes(q) ||
          (m.number ?? "").includes(q),
      )
      .slice(0, 8);
  }, [query, flat]);

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

  // Wheel zoom (non-passive).
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

  // Status fullscreen
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
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
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
        const midX = (pts[0].x + pts[1].x) / 2 - r.left;
        const midY = (pts[0].y + pts[1].y) / 2 - r.top;
        zoomAt(dist / pinchDist.current, midX, midY);
        pinchDist.current = dist;
      }
      return;
    }

    if (dragStart.current) {
      setTx(dragStart.current.tx + (e.clientX - dragStart.current.x));
      setTy(dragStart.current.ty + (e.clientY - dragStart.current.y));
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
    if (pointers.current.size === 0) dragStart.current = null;
    else if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()];
      dragStart.current = { x: p.x, y: p.y, tx, ty };
    }
  }

  const ctlCls =
    "flex h-10 w-10 items-center justify-center rounded-xl border border-edge bg-surface-3 text-primary-deep shadow-ambient transition-all hover:border-gold/40 hover:text-primary active:scale-95";

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative w-full cursor-grab touch-none overflow-hidden rounded-3xl border border-edge bg-surface/50 ring-glow active:cursor-grabbing ${
          fs ? "h-screen rounded-none" : "h-[74vh] min-h-[460px]"
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
              <ul>
                {roots.map((r) => (
                  <TreeNode key={r.id} m={r} highlightId={highlightId} />
                ))}
              </ul>
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
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                aria-label="Bersihkan"
              >
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
                      {m.spouseName && ` & ${m.spouseName}`}
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
            {fs ? <IconClose className="h-5 w-5" /> : <IconExpandFs />}
          </button>
        </div>

        <p className="absolute bottom-4 left-4 rounded-full border border-edge bg-surface/70 px-3 py-1 text-[11px] text-muted backdrop-blur">
          Seret untuk geser · cubit / scroll / tombol untuk zoom
        </p>
      </div>
    </div>
  );
}

function IconExpandFs() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-5 w-5">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}
