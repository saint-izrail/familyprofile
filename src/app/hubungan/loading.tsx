import { HeaderSkeleton, Skel } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 md:px-6">
      <HeaderSkeleton />
      <div className="space-y-4 rounded-3xl border border-edge bg-surface p-6 shadow-ambient md:p-8">
        <Skel className="h-12 w-full rounded-xl" />
        <Skel className="h-12 w-full rounded-xl" />
        <Skel className="mx-auto h-11 w-40 rounded-xl" />
      </div>
    </main>
  );
}
