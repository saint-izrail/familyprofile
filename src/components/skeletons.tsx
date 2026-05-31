// Primitif skeleton bersama untuk file loading.tsx (mengikuti bentuk PageHeader
// agar tak ada reflow saat konten asli tiba). Kelas .skeleton punya kilau (sheen).

export function Skel({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// Tiruan PageHeader: eyebrow-pill → judul → subjudul → divider, terpusat.
export function HeaderSkeleton({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <header className="mb-8 flex flex-col items-center text-center">
      <Skel className="h-6 w-40 rounded-full" />
      <Skel className="mt-4 h-10 w-72 max-w-[80%] rounded-xl" />
      {subtitle ? <Skel className="mt-3 h-4 w-96 max-w-[90%] rounded-md" /> : null}
      <div className="divider-gold mx-auto mt-5 max-w-xs" />
    </header>
  );
}
