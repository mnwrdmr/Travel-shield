"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Nasıl Çalışır?", href: "#how-it-works" },
  { label: "Özellikler", href: "#features" },
  { label: "Engellenen Tuzaklar", href: "#traps" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-zinc-950/90 backdrop-blur-lg border-b border-[var(--color-border)] shadow-lg shadow-black/20"
          : "bg-transparent"
      )}
    >
      <nav
        aria-label="Ana navigasyon"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-lg"
            aria-label="Travel Shield Ana Sayfa"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 group-hover:bg-[var(--color-primary)]/30 transition-colors duration-200">
              <Shield
                size={18}
                className="text-[var(--color-primary)]"
                aria-hidden="true"
              />
            </div>
            <span className="text-[var(--color-foreground)] font-bold text-lg tracking-tight">
              Travel
              <span className="text-[var(--color-primary)]">Shield</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium",
                    "text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)]",
                    "hover:bg-white/5 transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button asChild variant="default" size="sm">
              <Link href="/analyze">Sistemi Başlat</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            className={cn(
              "md:hidden flex items-center justify-center w-10 h-10 rounded-lg",
              "text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)]",
              "hover:bg-white/8 transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            )}
          >
            {menuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            menuOpen ? "max-h-80 opacity-100 pb-4" : "max-h-0 opacity-0"
          )}
          aria-hidden={!menuOpen}
        >
          <ul className="flex flex-col gap-1 pt-2" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 rounded-lg text-sm font-medium",
                    "text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)]",
                    "hover:bg-white/5 transition-all duration-150"
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-2 px-1">
              <Button asChild variant="default" size="md" className="w-full">
                <Link href="/analyze" onClick={() => setMenuOpen(false)}>
                  Sistemi Başlat
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
