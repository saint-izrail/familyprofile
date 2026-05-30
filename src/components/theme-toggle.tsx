"use client";

// Tombol ganti tema (light <-> dark). Tema disimpan di localStorage["theme"]
// dan diterapkan ke <html data-theme>. Penerapan awal oleh skrip inline di layout.
import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "@/components/icons";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) || "light";
    setTheme(current);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* abaikan */
    }
    setTheme(next);
  }

  const toDark = theme === "light";
  const label = toDark ? "Beralih ke tema gelap" : "Beralih ke tema terang";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-surface-2 text-primary-deep transition-all hover:bg-surface-3 hover:text-primary active:scale-95"
    >
      {toDark ? <IconMoon className="h-5 w-5" /> : <IconSun className="h-5 w-5" />}
    </button>
  );
}
