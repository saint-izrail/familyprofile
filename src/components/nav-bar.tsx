"use client";

// Navigasi global: lambang + tautan + pencarian (⌘K) + tombol tema. Sticky & glass.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import { IconHome, IconTree, IconList, IconSparkle, IconHeart } from "@/components/icons";

const NAV = [
  { href: "/", label: "Beranda", icon: IconHome },
  { href: "/silsilah", label: "Silsilah", icon: IconTree },
  { href: "/daftar", label: "Daftar", icon: IconList },
  { href: "/statistik", label: "Statistik", icon: IconSparkle },
  { href: "/hubungan", label: "Hubungan", icon: IconHeart },
];

export function NavBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-surface/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/" aria-label="Beranda" className="shrink-0 transition-opacity hover:opacity-90">
          <BrandMark size="sm" />
        </Link>

        <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
          <div className="flex items-center gap-0.5 overflow-x-auto sm:gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                  className={
                    active
                      ? "flex shrink-0 items-center gap-1.5 rounded-full bg-primary-dark px-2.5 py-2 text-sm font-semibold text-on-accent shadow-ambient lg:px-3.5"
                      : "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-primary/10 hover:text-primary-deep lg:px-3.5"
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="hidden sm:block">
            <CommandPalette />
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
