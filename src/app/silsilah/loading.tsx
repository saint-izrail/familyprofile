import { HeaderSkeleton, Skel } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
      <HeaderSkeleton />
      <Skel className="h-[74vh] min-h-[460px] w-full rounded-3xl" />
    </main>
  );
}
