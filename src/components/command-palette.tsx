"use client";

// Command palette pencarian anggota. Buka via tombol pemicu atau ⌘K / Ctrl+K.
// Mengambil data dari /api/search?q=… lalu menavigasi ke /anggota/<id>.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initials } from "@/lib/format";
import { useModal, isTopmost } from "@/components/use-modal";
import { IconSearch, IconClose, IconUser, IconArrowRight } from "@/components/icons";

type Result = {
  id: string;
  number: string | null;
  name: string;
  spouseName: string | null;
  avatarUrl: string | null;
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Kunci scroll + perangkap fokus + kembalikan fokus ke pemicu.
  const modalToken = useModal(open, dialogRef);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActive(0);
  }, []);

  // Pintasan global: ⌘K / Ctrl+K untuk toggle, Escape untuk menutup.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open && isTopmost(modalToken)) {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close, modalToken]);

  // Fokuskan input saat dibuka.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // Debounce pencarian (~200ms).
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setActive(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data: { results?: Result[] } = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setActive(0);
      } catch {
        /* dibatalkan atau gagal — abaikan */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  const navigate = useCallback(
    (id: string) => {
      router.push(`/anggota/${id}`);
      close();
    },
    [router, close],
  );

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = results[active];
      if (sel) navigate(sel.id);
    }
  }

  // Jaga item aktif tetap terlihat.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const q = query.trim();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka pencarian"
        className="flex items-center gap-2 rounded-full border border-edge bg-surface-2 px-2.5 py-2 text-sm text-muted transition-colors hover:border-edge-strong hover:text-primary-deep sm:px-3"
      >
        <IconSearch className="h-4 w-4" />
        <span className="hidden sm:inline">Cari…</span>
        <kbd className="ml-1 hidden rounded-md border border-edge bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div ref={dialogRef} className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Pencarian anggota">
          <button
            type="button"
            aria-label="Tutup pencarian"
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
          />

          <div className="relative mx-auto mt-[12vh] w-[92%] max-w-lg rounded-2xl border border-edge bg-surface-3 shadow-ambient-lg ring-glow">
            <div className="flex items-center gap-3 border-b border-edge px-4 py-3">
              <IconSearch className="h-5 w-5 shrink-0 text-primary" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Cari nama anggota atau nomor…"
                aria-label="Kata kunci pencarian"
                aria-controls="cmd-results"
                className="w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Tutup"
                className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-primary/10 hover:text-primary-deep"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {!q ? (
                <p className="px-3 py-8 text-center text-sm text-muted">Ketik untuk mencari…</p>
              ) : loading && results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted">Mencari…</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted">Tidak ada hasil</p>
              ) : (
                <ul ref={listRef} id="cmd-results" role="listbox" aria-label="Hasil pencarian" className="flex flex-col gap-1">
                  {results.map((r, i) => {
                    const isActive = i === active;
                    return (
                      <li key={r.id} role="option" aria-selected={isActive} data-index={i}>
                        <button
                          type="button"
                          onClick={() => navigate(r.id)}
                          onMouseMove={() => setActive(i)}
                          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                            isActive ? "bg-primary/10" : "hover:bg-primary/5"
                          }`}
                        >
                          {r.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.avatarUrl}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full border border-edge object-cover"
                            />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-edge bg-gold/15 text-sm font-semibold text-secondary">
                              {r.name ? initials(r.name) : <IconUser className="h-5 w-5" />}
                            </span>
                          )}

                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-ink">
                              {r.name}
                              {r.spouseName && (
                                <span className="text-muted"> &amp; {r.spouseName}</span>
                              )}
                            </span>
                          </span>

                          {r.number && (
                            <span className="shrink-0 rounded-full border border-edge bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                              {r.number}
                            </span>
                          )}
                          <IconArrowRight
                            className={`h-4 w-4 shrink-0 text-primary transition-opacity ${
                              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                            }`}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
