import type { MetadataRoute } from "next";

// Web App Manifest (PWA). Warna mengikuti tema pusaka: gading + emerald.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Bani Amenan Effendi & Siti Djamilah",
    short_name: "Bani Amenan",
    description:
      "Profil & silsilah keluarga besar Bani Amenan Effendi dan Siti Djamilah — pohon keluarga, daftar anggota, dan galeri foto.",
    start_url: "/",
    scope: "/",
    lang: "id",
    dir: "ltr",
    categories: ["lifestyle", "social"],
    display: "standalone",
    background_color: "#f6f3ea",
    theme_color: "#0f7a57",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/manifest-icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/manifest-icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/manifest-icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
