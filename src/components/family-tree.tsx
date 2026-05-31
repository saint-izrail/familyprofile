"use client";

// Pohon silsilah dengan TATA LETAK OTOMATIS + garis penghubung digambar manual.
// Garis dari atas selalu turun dari kartu KETURUNAN (kotak kiri); pasangan
// menempel di kanan lewat ♥ (menuju halaman keluarga). Anak turun dari kartu
// keturunan, bukan dari tengah pasangan.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TreeMember } from "@/lib/members";
import { initials } from "@/lib/format";
import { IconZoomIn, IconZoomOut, IconExpand, IconSearch, IconClose, IconHeart } from "@/components/icons";

const CARD_W = 196;
const CARD_H = 104;
const SPOUSE_GAP = 44;
const SPOUSE_W = 188;
const H_GAP = 56;
const LEVEL_H = 184;
const MIN = 0.2;
const MAX = 2.8;
const clamp = (v: number, min = MIN, max = MAX) => Math.min(max, Math.max(min, v));

type Laid = { m: TreeMember; cx: number; y: number };

// Tata letak otomatis: leaf mengisi slot horizontal; induk dipusatkan di atas
// anak-anaknya; ruang pasangan (kanan) ikut diperhitungkan agar tak menumpuk.
function computeLayout(roots: TreeMember[]) {
  const laid: Laid[] = [];
  let cursor = 0;
  const walk = (node: TreeMember, depth: number): number => {
    const y = depth * LEVEL_H;
    const spouseExt = node.partner ? SPOUSE_GAP + SPOUSE_W : 0;
    let cx: number;
    if (node.children.length === 0) {
      cx = cursor + CARD_W / 2;
      cursor += CARD_W + spouseExt + H_GAP;
    } else {
      const childCx = node.children.map((c) => walk(c, depth + 1));
      cx = (childCx[0] + childCx[childCx.length - 1]) / 2;
      const rightEdge = cx + CARD_W / 2 + spouseExt;
      if (rightEdge + H_GAP > cursor) cursor = rightEdge + H_GAP;
    }
    laid.push({ m: node, cx, y });
    return cx;
  };
  roots.forEach((r) => walk(r, 0));

  const pos = new Map(laid.map((l) => [l.m.id, l]));
  let maxX = 0;
  let maxY = 0;
  for (const l of laid) {
    const right = l.cx + CARD_W / 2 + (l.m.partner ? SPOUSE_GAP + SPOUSE_W : 0);
    if (right > maxX) maxX = right;
    if (l.y + CARD_H > maxY) maxY = l.y + CARD_H;
  }
  return { laid, pos, width: maxX + 20, height: maxY + 20 };
}

export function FamilyTree({ roots }: { roots: TreeMember[] }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [fs, setFs] = useState(false);

  const { laid, pos, width, height } = useMemo(() => computeLayout(roots), [roots]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Laid[];
    return laid
      .filter((l) => l.m.name.toLowerCase().includes(q) || (l.m.partner?.name ?? "").toLowerCase().includes(q) || (l.m.number ?? "").includes(q))
      .slice(0, 8);
  }, [query, laid]);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDist = useRef<number | null>(null);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const capturing = useRef(false);
  const dragged = useRef(false);

  const go = useCallback(
    (href: string) => {
      if (dragged.current) return;
      router.push(href);
    },
    [router],
  );

  const centerOn = useCallback((cx: number, cy: number, s?: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const sc = s ?? scale;
    setAnimating(true);
    setTx(r.width / 2 - sc * cx);
    setTy(r.height / 2 - sc * cy);
    window.setTimeout(() => setAnimating(false), 480);
  }, [scale]);

  // Posisi awal: pusatkan akar di atas.
  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    const el = wrapRef.current;
    const root = laid.find((l) => l.y === 0);
    if (!el || !root) return;
    inited.current = true;
    const r = el.getBoundingClientRect();
    setTx(r.width / 2 - 0.75 * root.cx);
    setTy(48);
  }, [laid]);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setScale((s) => {
      const ns = clamp(s * factor);
      setTx((t) => cx - (cx - t) * (ns / s));
      setTy((t) => cy - (cy - t) * (ns / s));
      return ns;
    });
  }, []);

  const btnZoom = useCallback((factor: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAnimating(true);
    zoomAt(factor, r.width / 2, r.height / 2);
    window.setTimeout(() => setAnimating(false), 320);
  }, [zoomAt]);

  const reset = useCallback(() => {
    const root = laid.find((l) => l.y === 0);
    setHighlightId(null);
    setScale(0.75);
    if (root) centerOn(root.cx, root.y + CARD_H / 2, 0.75);
  }, [laid, centerOn]);

  const focusNode = useCallback((id: string) => {
    const n = pos.get(id);
    if (!n) return;
    const ns = Math.max(scale, 0.9);
    setScale(ns);
    setHighlightId(id);
    centerOn(n.cx, n.y + CARD_H / 2, ns);
  }, [pos, scale, centerOn]);

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
    if (pointers.current.size === 1) dragStart.current = { x: e.clientX, y: e.clientY, tx, ty };
    else if (pointers.current.size === 2) {
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

  // Garis penghubung: dari bawah kartu keturunan -> bus horizontal -> tiap anak.
  const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const l of laid) {
    if (l.m.children.length === 0) continue;
    const childPos = l.m.children.map((c) => pos.get(c.id)!).filter(Boolean);
    if (childPos.length === 0) continue;
    const busY = l.y + CARD_H + (LEVEL_H - CARD_H) / 2;
    segments.push({ x1: l.cx, y1: l.y + CARD_H, x2: l.cx, y2: busY }); // turun dari keturunan
    const xs = childPos.map((c) => c.cx);
    segments.push({ x1: Math.min(...xs), y1: busY, x2: Math.max(...xs), y2: busY }); // bus
    for (const c of childPos) segments.push({ x1: c.cx, y1: busY, x2: c.cx, y2: c.y }); // ke tiap anak
  }

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative w-full touch-none overflow-hidden border border-edge bg-surface/50 ring-glow ${fs ? "h-screen rounded-none" : "h-[74vh] min-h-[460px] rounded-3xl"}`}
        style={{ touchAction: "none" }}
      >
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="absolute left-0 top-0 will-change-transform"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: "0 0", transition: animating ? "transform 0.45s cubic-bezier(0.2,0.7,0.2,1)" : "none" }}
        >
          <svg width={width} height={height} className="pointer-events-none absolute left-0 top-0 overflow-visible">
            <g fill="none" strokeWidth={2} style={{ stroke: "color-mix(in srgb, var(--gold) 55%, transparent)" }} strokeLinecap="round">
              {segments.map((s, i) => (
                <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
              ))}
            </g>
          </svg>

          {laid.map((l) => {
            const m = l.m;
            const dx = l.cx - CARD_W / 2;
            return (
              <div key={m.id}>
                {/* Kartu keturunan */}
                <button
                  type="button"
                  data-mid={m.id}
                  onClick={() => go(`/anggota/${m.id}`)}
                  style={{ left: dx, top: l.y, width: CARD_W, height: CARD_H }}
                  className={`absolute flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-surface-3 px-4 text-center transition-colors ${
                    highlightId === m.id ? "border-gold ring-2 ring-gold glow-primary" : "border-edge shadow-ambient hover:border-gold/45"
                  }`}
                >
                  <CardAvatar name={m.name} url={m.avatarUrl} />
                  <span className="line-clamp-2 text-sm font-semibold leading-tight text-ink">
                    {m.name}
                    {m.isDeceased && <span className="font-normal text-muted"> (alm)</span>}
                  </span>
                  {m.number && <span className="text-[10px] font-semibold tracking-wider text-secondary">{m.number}</span>}
                </button>

                {/* Pasangan + ♥ keluarga */}
                {m.partner && (
                  <>
                    <button
                      type="button"
                      onClick={() => go(`/keluarga/${m.id}`)}
                      title="Profil keluarga"
                      aria-label={`Profil keluarga ${m.name}`}
                      style={{ left: l.cx + CARD_W / 2 + SPOUSE_GAP / 2 - 14, top: l.y + CARD_H / 2 - 14, width: 28, height: 28 }}
                      className="absolute z-[1] flex items-center justify-center rounded-full border border-gold/45 bg-surface-3 text-secondary shadow-ambient transition-colors hover:bg-gold/10"
                    >
                      <IconHeart className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(`/anggota/${m.partner!.id}`)}
                      style={{ left: l.cx + CARD_W / 2 + SPOUSE_GAP, top: l.y, width: SPOUSE_W, height: CARD_H }}
                      className="absolute flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-edge bg-surface-3 px-4 text-center shadow-ambient transition-colors hover:border-gold/45"
                    >
                      <CardAvatar name={m.partner.name} url={m.partner.avatarUrl} />
                      <span className="line-clamp-2 text-sm font-semibold leading-tight text-ink">
                        {m.partner.name}
                        {m.partner.isDeceased && <span className="font-normal text-muted"> (alm)</span>}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">pasangan</span>
                    </button>
                  </>
                )}
              </div>
            );
          })}
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
              {matches.map((l) => (
                <li key={l.m.id}>
                  <button type="button" onClick={() => { focusNode(l.m.id); setQuery(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10">
                    <span className="truncate font-medium text-ink">
                      {l.m.name}
                      {l.m.partner && ` & ${l.m.partner.name}`}
                    </span>
                    {l.m.number && <span className="ml-auto shrink-0 text-[10px] text-secondary">{l.m.number}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button type="button" onClick={() => btnZoom(1.25)} aria-label="Perbesar" className={ctlCls}><IconZoomIn className="h-5 w-5" /></button>
          <button type="button" onClick={() => btnZoom(0.8)} aria-label="Perkecil" className={ctlCls}><IconZoomOut className="h-5 w-5" /></button>
          <button type="button" onClick={reset} aria-label="Atur ulang" className={ctlCls}><IconExpand className="h-5 w-5" /></button>
          <button type="button" onClick={toggleFullscreen} aria-label={fs ? "Keluar layar penuh" : "Layar penuh"} className={ctlCls}>{fs ? <IconClose className="h-5 w-5" /> : <IconExpand className="h-5 w-5 rotate-45" />}</button>
        </div>

        <p className="absolute bottom-4 left-4 rounded-full border border-edge bg-surface/70 px-3 py-1 text-[11px] text-muted backdrop-blur">
          Ketuk kartu untuk profil · seret untuk geser · cubit / scroll untuk zoom
        </p>
      </div>
    </div>
  );
}

function CardAvatar({ name, url }: { name: string; url: string | null }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-primary/10 text-xs font-semibold text-primary">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
