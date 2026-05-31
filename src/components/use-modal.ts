import { useEffect, useRef, useState } from "react";

// Tumpukan modal global agar HANYA dialog teratas yang memerangkap fokus
// (mis. cropper di atas modal usulan tidak saling rebut fokus).
const modalStack: object[] = [];

// Apakah token ini modal teratas? Dipakai handler Escape tiap komponen agar
// satu Escape tak menutup dua dialog bertumpuk sekaligus.
export function isTopmost(token: object): boolean {
  if (modalStack.length === 0) return true;
  return modalStack[modalStack.length - 1] === token;
}

// Pengeras dialog bersama: saat terbuka -> kunci scroll latar, perangkap fokus
// (Tab melingkar, hanya untuk modal teratas), dan kembalikan fokus ke pemicu
// saat ditutup. TIDAK mengatur fokus awal — tiap komponen mengaturnya sendiri.
export function useModal(open: boolean, containerRef: { current: HTMLElement | null }): object {
  const triggerRef = useRef<HTMLElement | null>(null);
  // Identitas stabil per-instance (aman dibaca saat render, beda dari ref).
  const [token] = useState<object>(() => ({}));

  useEffect(() => {
    if (!open) return;
    triggerRef.current = (document.activeElement as HTMLElement) ?? null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    modalStack.push(token);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (modalStack[modalStack.length - 1] !== token) return; // bukan modal teratas
      const container = containerRef.current;
      if (!container) return;
      const items = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.getClientRects().length > 0);
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      const i = modalStack.indexOf(token);
      if (i >= 0) modalStack.splice(i, 1);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      triggerRef.current?.focus?.();
    };
  }, [open, containerRef, token]);

  return token;
}
