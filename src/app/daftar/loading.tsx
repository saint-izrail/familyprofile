import { HeaderSkeleton, Skel } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
      <HeaderSkeleton subtitle={false} />
      <div className="flex flex-col gap-2.5 rounded-3xl border border-edge bg-surface p-6 shadow-ambient md:p-8">
        {["w-3/4", "w-2/3", "w-11/12", "w-1/2", "w-3/4", "w-2/3", "w-10/12", "w-1/2"].map((w, i) => (
          <Skel key={i} className={`h-7 rounded-lg ${w}`} />
        ))}
      </div>
    </main>
  );
}
