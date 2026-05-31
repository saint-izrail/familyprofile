import type { Metadata } from "next";

// Seluruh area admin tidak boleh diindeks (defense-in-depth di atas robots.ts).
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
