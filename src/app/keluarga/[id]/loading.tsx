import { Skel } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <Skel className="h-5 w-40 rounded-md" />
      <section className="mt-5 overflow-hidden rounded-3xl border border-edge bg-surface shadow-ambient">
        <Skel className="aspect-[16/9] w-full rounded-none" />
        <div className="flex flex-col items-center gap-3 p-6 md:p-8">
          <Skel className="h-6 w-32 rounded-full" />
          <Skel className="h-9 w-2/3 rounded-lg" />
        </div>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skel key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
