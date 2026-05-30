import { getTree, type TreeMember } from "@/lib/members";
import { MemberList } from "@/components/member-list";
import { Reveal } from "@/components/reveal";
import { IconList } from "@/components/icons";

export const dynamic = "force-dynamic";

function countNodes(nodes: TreeMember[]): number {
  return nodes.reduce((n, x) => n + 1 + countNodes(x.children), 0);
}

export default async function DaftarPage() {
  let tree: TreeMember[] = [];
  let failed = false;
  try {
    tree = await getTree();
  } catch {
    failed = true;
  }
  const total = countNodes(tree);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
      <Reveal>
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
            <IconList className="h-3.5 w-3.5" />
            Daftar Anggota
          </span>
          <h1 className="mt-4 font-serif text-3xl font-extrabold md:text-5xl">
            <span className="gold-text">Daftar Keluarga</span>
          </h1>
          {total > 0 && (
            <p className="mt-3 text-sm text-muted">
              <span className="font-semibold text-ink">{total}</span> anggota tercatat
            </p>
          )}
          <div className="divider-gold mx-auto mt-5 max-w-xs" />
        </header>
      </Reveal>

      <Reveal delay={80}>
        <section className="rounded-3xl border border-edge bg-surface p-6 shadow-ambient backdrop-blur-xl md:p-8">
          {failed || tree.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-serif text-lg font-bold text-primary-deep">
                {failed ? "Belum tersambung ke database" : "Belum ada data"}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                {failed
                  ? "Data akan tampil setelah konfigurasi database selesai."
                  : "Tambahkan anggota melalui halaman admin."}
              </p>
            </div>
          ) : (
            <MemberList roots={tree} />
          )}
        </section>
      </Reveal>
    </main>
  );
}
