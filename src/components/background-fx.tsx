// Latar dekoratif: grid titik + orb ambient melayang. Murni presentational.
// Letakkan di container ber-`position: relative; overflow-hidden`.
export function BackgroundFX({
  variant = "default",
}: {
  variant?: "default" | "hero";
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-[120px] animate-float-slow" />
      <div className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-gold/10 blur-[130px] animate-float" />
      {variant === "hero" && (
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/10 blur-[120px] animate-glow" />
      )}
    </div>
  );
}
