"use client";

// Pohon silsilah interaktif: tampil seluruhnya, bisa di-zoom & geser (pan).
// Wheel = zoom ke arah kursor, drag = geser, tombol = zoom in/out + reset.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { TreeMember } from "@/lib/members";
import { initials } from "@/lib/format";
import { IconZoomIn, IconZoomOut, IconExpand } from "@/components/icons";

const MIN = 0.25;
const MAX = 2.5;
const clamp = (v: number, min = MIN, max = MAX) => Math.min(max, Math.max(min, v));

function NodeCard({ m }: { m: TreeMember }) {
  return (
    <Link
      href={`/anggota/${m.id}`}
      className="group inline-flex w-[200px] flex-col items-center gap-2 rounded-2xl border border-edge bg-surface-3 px-4 py-4 text-center shadow-ambient transition-all hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-ambient-lg"
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

function TreeNode({ m }: { m: TreeMember }) {
  return (
    <li>
      <NodeCard m={m} />
      {m.children.length > 0 && (
        <ul>
          {m.children.map((c) => (
            <TreeNode key={c.id} m={c} />
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
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

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
      zoomAt(factor, r.width / 2, r.height / 2);
    },
    [zoomAt],
  );

  const reset = useCallback(() => {
    setScale(0.8);
    setTx(0);
    setTy(0);
  }, []);

  // Wheel zoom (non-passive agar bisa preventDefault).
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

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { x: e.clientX, y: e.clientY, tx, ty };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setTx(drag.current.tx + (e.clientX - drag.current.x));
    setTy(drag.current.ty + (e.clientY - drag.current.y));
  }
  function onPointerUp(e: React.PointerEvent) {
    drag.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
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
        onPointerLeave={onPointerUp}
        className="relative h-[74vh] min-h-[460px] w-full cursor-grab overflow-hidden rounded-3xl border border-edge bg-surface/50 ring-glow active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="absolute left-1/2 top-12 will-change-transform"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: "0 0" }}
        >
          <div className="-translate-x-1/2">
            <div className="familytree">
              <ul>
                {roots.map((r) => (
                  <TreeNode key={r.id} m={r} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Kontrol zoom */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <button type="button" onClick={() => btnZoom(1.25)} aria-label="Perbesar" className={ctlCls}>
          <IconZoomIn className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => btnZoom(0.8)} aria-label="Perkecil" className={ctlCls}>
          <IconZoomOut className="h-5 w-5" />
        </button>
        <button type="button" onClick={reset} aria-label="Atur ulang tampilan" className={ctlCls}>
          <IconExpand className="h-5 w-5" />
        </button>
      </div>

      <p className="absolute bottom-4 left-4 rounded-full border border-edge bg-surface/70 px-3 py-1 text-[11px] text-muted backdrop-blur">
        Seret untuk geser · scroll / tombol untuk zoom
      </p>
    </div>
  );
}
