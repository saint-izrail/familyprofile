import { Skel } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skel className="h-5 w-40 rounded-md" />
        <Skel className="h-9 w-40 rounded-full" />
      </div>
      <section className="mt-5 rounded-3xl border border-edge bg-surface p-6 shadow-ambient md:p-8">
        <div className="flex flex-col items-center gap-7 md:flex-row md:items-start">
          <Skel className="aspect-square w-full max-w-[16rem] shrink-0 rounded-3xl md:w-64" />
          <div className="w-full flex-1 space-y-3">
            <Skel className="mx-auto h-9 w-2/3 rounded-lg md:mx-0" />
            <Skel className="mx-auto h-4 w-40 rounded-md md:mx-0" />
            <div className="space-y-2 pt-4">
              <Skel className="h-3 w-full rounded-md" />
              <Skel className="h-3 w-11/12 rounded-md" />
              <Skel className="h-3 w-3/4 rounded-md" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
