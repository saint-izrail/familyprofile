import type { Metadata } from "next";
import { getTree, type TreeMember } from "@/lib/members";
import { MemberList } from "@/components/member-list";
import { Reveal } from "@/components/reveal";
import { PageHeader } from "@/components/page-header";
import { IconList } from "@/components/icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Daftar Anggota" };

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
      <PageHeader
        eyebrow="Daftar Anggota"
        icon={IconList}
        title="Daftar Keluarga"
        subtitle={
          total > 0 ? (
            <>
              <span className="font-semibold text-ink">{total}</span> anggota tercatat
            </>
          ) : undefined
        }
      />

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
