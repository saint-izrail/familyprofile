import type { MetadataRoute } from "next";

// Privasi: ini data pribadi keluarga (nama, kelahiran, foto anggota yang masih
// hidup), jadi situs disetel TIDAK diindeks mesin pencari secara default.
// Tautan tetap bisa dibagikan langsung (kartu OG tetap muncul di WhatsApp/FB).
// Untuk membuka pengindeksan: ganti `disallow: "/"` menjadi
// `allow: "/"` + `disallow: ["/admin/", "/api/"]` dan tambahkan sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
