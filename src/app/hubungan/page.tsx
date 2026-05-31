import type { Metadata } from "next";
import { getFlatMembers, type FlatMember } from "@/lib/members";
import { RelationFinder } from "@/components/relation-finder";
import { Reveal } from "@/components/reveal";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { IconUsers } from "@/components/icons";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Hubungan Kekerabatan" };

export default async function HubunganPage() {
  let members: FlatMember[] = [];
  let failed = false;
  try {
    members = await getFlatMembers();
  } catch {
    failed = true;
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 md:px-6">
      <PageHeader
        eyebrow="Kalkulator Hubungan"
        icon={IconUsers}
        title="Hubungan Kekerabatan"
        subtitle="Pilih dua anggota untuk melihat hubungan kekerabatan di antara keduanya."
      />

      <Reveal delay={80}>
        {failed || members.length === 0 ? (
          <EmptyState
            icon={IconUsers}
            title={failed ? "Belum tersambung ke database" : "Belum ada data anggota"}
            description={
              failed
                ? "Kalkulator akan tampil setelah konfigurasi database selesai."
                : "Tambahkan anggota terlebih dahulu melalui halaman admin."
            }
          />
        ) : (
          <RelationFinder members={members} />
        )}
      </Reveal>
    </main>
  );
}
