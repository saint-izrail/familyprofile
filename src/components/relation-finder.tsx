"use client";

// Kalkulator hubungan kekerabatan: pilih dua anggota, hubungan dihitung langsung.
import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { relationship } from "@/lib/relations";
import type { FlatMember } from "@/lib/members";
import { Reveal } from "@/components/reveal";
import { IconArrowRight, IconHeart, IconSparkle, IconUser } from "@/components/icons";

type Member = FlatMember;

function memberLabel(m: Member): string {
  const prefix = m.number ? `${m.number} ` : "";
  const spouse = m.spouseName ? ` & ${m.spouseName}` : "";
  return `${prefix}${m.name}${spouse}`;
}

export function RelationFinder({ members }: { members: Member[] }) {
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const aLabelId = useId();
  const bLabelId = useId();
  const resultId = useId();

  const both = Boolean(aId && bId);

  const result = useMemo(() => {
    if (!aId || !bId) return null;
    try {
      return relationship(aId, bId, members);
    } catch {
      return null;
    }
  }, [aId, bId, members]);

  const swap = () => {
    setAId(bId);
    setBId(aId);
  };

  const lcaName = result?.lcaId
    ? members.find((m) => m.id === result.lcaId)?.name ?? null
    : null;

  const selectClass =
    "w-full appearance-none rounded-xl border border-edge-strong bg-surface-2 px-4 py-3 text-sm text-ink shadow-ambient transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <section className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient backdrop-blur-xl md:p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="flex flex-col gap-5"
      >
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-1.5">
            <label
              id={aLabelId}
              htmlFor="relation-a"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary"
            >
              <IconUser className="h-3.5 w-3.5" />
              Anggota A
            </label>
            <select
              id="relation-a"
              aria-labelledby={aLabelId}
              value={aId}
              onChange={(e) => setAId(e.target.value)}
              className={selectClass}
            >
              <option value="">Pilih anggota…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {memberLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center pb-1 md:pb-3">
            <button
              type="button"
              onClick={swap}
              aria-label="Tukar Anggota A dan Anggota B"
              title="Tukar"
              className="hover-lift inline-flex h-11 w-11 items-center justify-center rounded-full border border-edge-strong bg-surface-2 text-secondary transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <IconArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
              <span className="sr-only">Tukar A dan B</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              id={bLabelId}
              htmlFor="relation-b"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary"
            >
              <IconUser className="h-3.5 w-3.5" />
              Anggota B
            </label>
            <select
              id="relation-b"
              aria-labelledby={bLabelId}
              value={bId}
              onChange={(e) => setBId(e.target.value)}
              className={selectClass}
            >
              <option value="">Pilih anggota…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {memberLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!both}
          className="btn-shine ring-glow inline-flex items-center justify-center gap-2 self-center rounded-xl bg-primary-dark px-6 py-3 text-sm font-semibold text-on-accent shadow-ambient-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconSparkle className="h-4 w-4" />
          Lihat Hubungan
        </button>
      </form>

      <div aria-live="polite">
        {both && (submitted || result) && (
          <Reveal key={`${aId}-${bId}`} className="mt-7">
            {result ? (
              <article
                id={resultId}
                className="ring-glow rounded-2xl border border-gold/30 bg-surface-2/70 p-6 text-center shadow-ambient backdrop-blur-xl"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-secondary">
                  <IconHeart className="h-6 w-6" />
                </div>
                <p className="font-serif text-xl font-extrabold leading-snug md:text-2xl">
                  <span className="gold-text">{result.label}</span>
                </p>
                {result.detail && (
                  <p className="mt-3 text-sm text-muted">{result.detail}</p>
                )}
                {result.lcaId && (
                  <Link
                    href={`/anggota/${result.lcaId}`}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-edge-strong bg-surface px-4 py-2 text-xs font-semibold text-primary-deep transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    Lihat leluhur bersama{lcaName ? `: ${lcaName}` : ""}
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </article>
            ) : (
              <article
                id={resultId}
                className="rounded-2xl border border-edge bg-surface-2/70 p-6 text-center shadow-ambient"
              >
                <p className="font-serif text-lg font-bold text-primary-deep">
                  Hubungan tidak dapat ditentukan
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                  Kedua anggota belum memiliki keterkaitan yang tercatat dalam silsilah.
                </p>
              </article>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
