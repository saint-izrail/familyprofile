export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
      <div className="mx-auto mb-8 h-10 w-56 animate-pulse rounded-xl bg-surface-2" />
      <div className="flex flex-col gap-2 rounded-3xl border border-edge bg-surface p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-7 animate-pulse rounded-lg bg-surface-2" style={{ width: `${70 - (i % 4) * 12}%`, animationDelay: `${i * 70}ms` }} />
        ))}
      </div>
    </main>
  );
}
