"use client";

// Navigasi global: lambang keluarga + tautan + tombol tema. Sticky & glass.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconHome, IconTree, IconList } from "@/components/icons";

const NAV = [
  { href: "/", label: "Beranda", icon: IconHome },
  { href: "/silsilah", label: "Silsilah", icon: IconTree },
  { href: "/daftar", label: "Daftar", icon: IconList },
];

export function NavBar() {
  const pathname = usePathname();
  // Sembunyikan navbar di area admin (punya layout sendiri).
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-surface/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" aria-label="Beranda" className="transition-opacity hover:opacity-90">
          <BrandMark size="sm" />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex items-center gap-1.5 rounded-full bg-primary-dark px-3 py-2 text-sm font-semibold text-on-accent shadow-ambient sm:px-4"
                    : "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-primary/10 hover:text-primary-deep sm:px-4"
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">{item.label}</span>
              </Link>
            );
          })}
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
