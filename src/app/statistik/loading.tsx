import { HeaderSkeleton, Skel } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skel key={i} className="h-40 rounded-3xl" />
        ))}
      </div>
      <div className="mt-12 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skel key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
