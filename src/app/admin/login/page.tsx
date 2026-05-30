"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { BackgroundFX } from "@/components/background-fx";
import { IconLock, IconArrowRight } from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(json?.message ?? "Gagal masuk.");
        setLoading(false);
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4">
      <BackgroundFX variant="hero" />
      <div className="w-full max-w-[400px]">
        <div className="rounded-3xl border border-gold/25 bg-surface p-8 shadow-ambient-xl ring-glow backdrop-blur-2xl md:p-10">
          <div className="flex flex-col items-center text-center">
            <BrandMark size="lg" withText={false} />
            <h1 className="mt-5 font-serif text-2xl font-bold gold-text">Panel Admin</h1>
            <p className="mt-2 text-sm text-muted">Masuk untuk mengelola data keluarga.</p>
          </div>
          <div className="divider-gold my-6" />
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={loading}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pw" className="ml-1 text-sm font-semibold text-ink">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  <IconLock className="h-5 w-5" />
                </span>
                <input
                  id="pw"
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full rounded-xl border border-edge-strong bg-surface-2 py-3.5 pl-12 pr-4 text-base text-ink outline-none transition-all placeholder:text-muted focus:border-primary-dark focus:bg-surface-3 focus:ring-4 focus:ring-primary/20"
                />
              </div>
            </div>
            {error && (
              <p role="alert" className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="btn-shine mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-dark py-3.5 text-base font-semibold text-on-accent shadow-ambient-lg transition-all hover:bg-primary-deep active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
              {!loading && <IconArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
