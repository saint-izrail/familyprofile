import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";
import { ServiceWorkerRegister } from "@/components/sw-register";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
});

// Terapkan tema dari localStorage sebelum paint (default: light) agar tak kedip.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='light';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyprofile-three.vercel.app";
const SITE_NAME = "Bani Amenan Effendi & Siti Djamilah";
const SITE_DESC =
  "Profil & silsilah keluarga besar Bani Amenan Effendi dan Siti Djamilah — pohon keluarga, daftar anggota, agenda, dan galeri foto.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: "%s — Bani Amenan Effendi" },
  description: SITE_DESC,
  applicationName: "Bani Amenan",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Bani Amenan" },
  icons: { apple: "/manifest-icon-192" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESC },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f7a57" },
    { media: "(prefers-color-scheme: dark)", color: "#0a120e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-theme="light"
      suppressHydrationWarning
      className={`${jakarta.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a href="#konten" className="skip-link">
          Lewati ke konten
        </a>
        <NavBar />
        {/* Wrapper sasaran skip-link (bukan <main> agar tak bertumpuk dengan <main> tiap halaman). */}
        <div id="konten" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </div>
        <SiteFooter />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
