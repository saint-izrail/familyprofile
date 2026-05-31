import type { Metadata } from "next";
import { getTree, type TreeMember } from "@/lib/members";
import { FamilyTree } from "@/components/family-tree";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { IconTree } from "@/components/icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Silsilah" };

export default async function SilsilahPage() {
  let tree: TreeMember[] = [];
  let failed = false;
  try {
    tree = await getTree();
  } catch {
    failed = true;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
      <PageHeader
        eyebrow="Pohon Keluarga"
        icon={IconTree}
        title="Silsilah Keluarga"
        subtitle="Seret untuk menjelajah, cubit/Ctrl+gulir untuk memperbesar, atau pakai panah keyboard. Klik kartu untuk membuka profil anggota."
      />

      {failed || tree.length === 0 ? (
        <EmptyState
          icon={IconTree}
          title={failed ? "Belum tersambung ke database" : "Belum ada data silsilah"}
          description={
            failed
              ? "Data akan tampil setelah konfigurasi database selesai."
              : "Tambahkan anggota pertama melalui halaman admin."
          }
        />
      ) : (
        <FamilyTree roots={tree} />
      )}
    </main>
  );
}
