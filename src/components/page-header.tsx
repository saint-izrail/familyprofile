// Header halaman terpusat: eyebrow-pill → judul → subjudul → aksi → divider.
// Satu sumber spasi/tipografi agar lima rute konsisten (sebelumnya copy-paste).
import type { ComponentType, ReactNode, SVGProps } from "react";
import { Reveal } from "@/components/reveal";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export function PageHeader({
  eyebrow,
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  icon: IconType;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Reveal>
      <header className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
          <Icon className="h-3.5 w-3.5" />
          {eyebrow}
        </span>
        <h1 className="mt-4 font-serif text-3xl font-extrabold md:text-5xl">
          <span className="gold-text">{title}</span>
        </h1>
        {subtitle ? <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{subtitle}</p> : null}
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
        <div className="divider-gold mx-auto mt-5 max-w-xs" />
      </header>
    </Reveal>
  );
}
