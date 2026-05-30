// Seed pohon keluarga — disalin dari daftar yang diberikan.
// Catatan: beberapa nomor pada sumber ada salah ketik (mis. anak 3.6.2 tertulis
// "3.6.1.2"), di sini sudah dirapikan agar konsisten. Nama dipertahankan apa adanya.
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

type Node = {
  number: string;
  name: string;
  spouseName?: string;
  isDeceased?: boolean;
  spouseDeceased?: boolean;
  children?: Node[];
};

const ROOT: Node = {
  number: "3.6",
  name: "Amenan Effendi",
  spouseName: "Siti Djamilah",
  children: [
    {
      number: "3.6.1",
      name: "Qois Zubaida",
      spouseName: "Subandriyo",
      children: [
        {
          number: "3.6.1.1",
          name: "Nur Wulan Sarwo Rini",
          spouseName: "Agus Endarto",
          children: [
            { number: "3.6.1.1.1", name: "Nafiah Lintang Saraswati", isDeceased: true },
            { number: "3.6.1.1.2", name: "Haidar Lintang Nuswantoro" },
            { number: "3.6.1.1.3", name: "Izzatunissa Lintang Jennitra" },
          ],
        },
        {
          number: "3.6.1.2",
          name: "Andi Nur Cahyo Utomo",
          spouseName: "Fitri",
          children: [
            { number: "3.6.1.2.1", name: "Adeeva Cahya Callista" },
            { number: "3.6.1.2.2", name: "Al Wafi Cahya Rajendra" },
            { number: "3.6.1.2.3", name: "Al Varo Cahya Mahendra" },
          ],
        },
      ],
    },
    {
      number: "3.6.2",
      name: "Firdaus S.U",
      spouseName: "Kuri Ilmiyati",
      children: [
        {
          number: "3.6.2.1",
          name: "Vivin Zulfa Atina",
          spouseName: "Aristya Indratama",
          children: [{ number: "3.6.2.1.1", name: "Resyakila Lituhayu Arisanti" }],
        },
        {
          number: "3.6.2.2",
          name: "Rusydan Saeful Utomo",
          spouseName: "Sari Wulandari",
          children: [{ number: "3.6.2.2.1", name: "Arsakha Rasendria Al-Rasyad" }],
        },
        { number: "3.6.2.3", name: "Firmansyah Nur Utomo", spouseName: "Tri Mulyati" },
        { number: "3.6.2.4", name: "Muhammad Fahri Nur Utomo" },
      ],
    },
    {
      number: "3.6.3",
      name: "Budi Panji Sukmono",
      spouseName: "Nuriah",
      children: [
        {
          number: "3.6.3.1",
          name: "Putri Nur Ratnasari",
          spouseName: "Rahmad Ade Surya",
          children: [{ number: "3.6.3.1.1", name: "Haziqah Almahyra Jannah" }],
        },
        { number: "3.6.3.2", name: "Nur Muhammad Fatahu Rozaq" },
      ],
    },
    {
      number: "3.6.4",
      name: "Erma Sukmawati",
      spouseName: "Yani Tri Hakoso",
      children: [
        { number: "3.6.4.1", name: "Muh. Nur Arka Putra" },
        {
          number: "3.6.4.2",
          name: "Muh Fauzi Dwi Hakoso",
          spouseName: "Dini Restumurti",
          children: [
            { number: "3.6.4.2.1", name: "Abercio Faeyza Putra Hakoso" },
            { number: "3.6.4.2.2", name: "Gavin Zenecka Kenzi Hakoso" },
          ],
        },
      ],
    },
    {
      number: "3.6.5",
      name: "Buyung Sukmo Prasetyo",
      spouseName: "Rona Maijes",
      children: [
        { number: "3.6.5.1", name: "Farhan Surya Kusuma" },
        { number: "3.6.5.2", name: "Taufiq Surya Kusuma" },
      ],
    },
    {
      number: "3.6.6",
      name: "Didin Sukmo Prasojo",
      spouseName: "Hirania Tirsani",
      children: [
        { number: "3.6.6.1", name: "Muh Daffa Adyatma Prasojo" },
        { number: "3.6.6.2", name: "Tsabita Nasya Anindita Prasojo" },
        { number: "3.6.6.3", name: "Khalisa Naura Anindita Prasojo" },
      ],
    },
    {
      number: "3.6.7",
      name: "Indah Sukma Ningrum",
      spouseName: "Budi Santoso",
      children: [
        { number: "3.6.7.1", name: "Muh Farid Aji Nur Wahid" },
        { number: "3.6.7.2", name: "Almaira Aira" },
      ],
    },
    {
      number: "3.6.8",
      name: "Subuh Sukmono Putro",
      spouseName: "Diana Laraswati",
      children: [
        { number: "3.6.8.1", name: "Aqsal Raffa Sandito" },
        { number: "3.6.8.2", name: "Dinda Aura Kahirunnisa" },
      ],
    },
    {
      number: "3.6.9",
      name: "Teguh Jati Sukmono",
      spouseName: "Lastriana",
      children: [
        { number: "3.6.9.1", name: "Annisa Nur Zahrany" },
        { number: "3.6.9.2", name: "Muh Alfatih Nur Adika Sukmana" },
        { number: "3.6.9.3", name: "Aleza Tiara Nur Febriana" },
      ],
    },
    {
      number: "3.6.10",
      name: "Bakhtiar Sukmo Wibowo",
      spouseName: "Yani Kustiar",
      children: [
        { number: "3.6.10.1", name: "Raisa Aisyah Arlin Wibowo" },
        { number: "3.6.10.2", name: "Zhafiira Aqilah Wibowo" },
      ],
    },
    {
      number: "3.6.11",
      name: "Taufan Sukmo Santoso",
      spouseName: "Jane Novita",
      children: [{ number: "3.6.11.1", name: "Neima Assyifa Mecca" }],
    },
  ],
};

async function insertNode(node: Node, parentId: string | null, order: number) {
  // Anggota garis keturunan (blood descendant)
  const desc = await prisma.member.create({
    data: {
      number: node.number,
      name: node.name,
      spouseName: node.spouseName ?? null, // denormalized untuk tampilan ringkas
      isDeceased: node.isDeceased ?? false,
      spouseDeceased: node.spouseDeceased ?? false,
      parentId,
      order,
      marriedIn: false,
    },
  });

  // Pasangan sebagai anggota nyata (punya halaman sendiri), saling tertaut.
  if (node.spouseName) {
    const spouse = await prisma.member.create({
      data: {
        name: node.spouseName,
        spouseName: node.name,
        isDeceased: node.spouseDeceased ?? false,
        spouseDeceased: node.isDeceased ?? false,
        marriedIn: true,
        order: 0,
        partnerId: desc.id,
      },
    });
    await prisma.member.update({ where: { id: desc.id }, data: { partnerId: spouse.id } });
  }

  let i = 0;
  for (const child of node.children ?? []) {
    await insertNode(child, desc.id, i++);
  }
}

async function main() {
  // Reset agar idempoten
  await prisma.photo.deleteMany();
  await prisma.member.deleteMany();
  await insertNode(ROOT, null, 0);
  const count = await prisma.member.count();
  console.log(`✓ Seeded ${count} anggota keluarga.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
