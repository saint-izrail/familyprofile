"use client";

// Tombol bagikan: pakai Web Share API bila ada, jika tidak salin tautan.
import { useState } from "react";
import { IconExternal } from "@/components/icons";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav && "share" in nav) {
      try {
        await nav.share({ title, url });
        return;
      } catch {
        /* dibatalkan / tidak didukung -> fallback salin */
      }
    }
    try {
      await nav?.clipboard?.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2 px-4 py-2 text-sm font-medium text-primary-deep transition-colors hover:bg-primary/5"
    >
      <IconExternal className="h-4 w-4" />
      {copied ? "Tautan tersalin!" : "Bagikan"}
    </button>
  );
}
