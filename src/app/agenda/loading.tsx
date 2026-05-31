import { HeaderSkeleton, Skel } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <HeaderSkeleton />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-3xl border border-edge bg-surface p-5 shadow-ambient md:gap-5 md:p-6"
          >
            <Skel className="h-16 w-16 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2.5">
              <Skel className="h-4 w-28 rounded-full" />
              <Skel className="h-6 w-2/3 rounded-lg" />
              <Skel className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
