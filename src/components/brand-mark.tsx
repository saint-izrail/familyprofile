// Lambang keluarga: ikon pohon dalam tile + wordmark.
import { IconTree } from "@/components/icons";

export function BrandMark({
  size = "md",
  withText = true,
}: {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}) {
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const title = size === "lg" ? "text-lg" : "text-sm";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative flex ${box} shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-primary/10 text-primary`}
      >
        <span aria-hidden className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/15" />
        <IconTree className={icon} />
      </div>
      {withText && (
        <div className="leading-tight">
          <p className={`font-serif font-bold gold-text ${title}`}>Bani Amenan Effendi</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">&amp; Siti Djamilah</p>
        </div>
      )}
    </div>
  );
}
