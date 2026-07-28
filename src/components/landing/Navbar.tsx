"use client";

/**
 * @file Navbar.tsx
 * @description Global üst navigasyon çubuğu.
 *
 * Sorumluluklar:
 *  - Logo → ana sayfaya yönlendirir
 *  - "Ücretsiz Analiz Başlat" CTA → /analyze
 *  - Mobil hamburger menüsü
 *
 * Kasıtlı olarak dahil edilmeyenler:
 *  - Ara sayfa linkleri (Seyahat Analizi, Sonuçlar) —
 *    kullanıcı akışı CTA üzerinden yönetilir.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Shield, ScanLine, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn }     from "@/lib/utils";

// ─── Sabitler ────────────────────────────────────────────────
const SCROLL_THRESHOLD   = 16;   // px — kaydırma algılama eşiği
const DESKTOP_BREAKPOINT = 768;  // px — md breakpoint

// ─── Yardımcı hook'lar ───────────────────────────────────────

/** Sayfanın SCROLL_THRESHOLD px'den fazla kaydırılıp kaydırılmadığını izler. */
function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrolled;
}

/** Ekran genişliği masaüstü eşiğini aştığında verilen setter'ı false'a çeker. */
function useCloseOnResize(setOpen: (v: false) => void): void {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);
}

// ─── Alt bileşenler ──────────────────────────────────────────

interface LogoProps {
  className?: string;
}

function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Travel Shield — Ana Sayfa"
      className={cn(
        "group flex items-center gap-2.5 rounded-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        className
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          "border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/20",
          "transition-colors duration-200 group-hover:bg-[var(--color-primary)]/30"
        )}
      >
        <Shield size={18} className="text-[var(--color-primary)]" aria-hidden />
      </div>

      <span className="text-lg font-bold tracking-tight text-[var(--color-foreground)]">
        Travel<span className="text-[var(--color-primary)]">Shield</span>
      </span>
    </Link>
  );
}

interface CtaButtonProps {
  onClick: () => void;
  className?: string;
}

function CtaButton({ onClick, className }: CtaButtonProps) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      className={cn("gap-2", className)}
    >
      <ScanLine size={14} aria-hidden />
      Ücretsiz Analiz Başlat
    </Button>
  );
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onCtaClick: () => void;
}

function MobileMenu({ open, onClose, onCtaClick }: MobileMenuProps) {
  return (
    <div
      id="mobile-menu"
      role="region"
      aria-label="Mobil menü"
      aria-hidden={!open}
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out md:hidden",
        open ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className="px-1 pt-2">
        <CtaButton onClick={() => { onClose(); onCtaClick(); }} className="w-full" />
      </div>
    </div>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────

export default function Navbar() {
  const router  = useRouter();
  const scrolled = useScrolled();

  const [menuOpen, setMenuOpen] = useState(false);

  useCloseOnResize(() => setMenuOpen(false));

  const navigateToAnalyze = () => router.push("/analyze");

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[var(--color-border)] bg-zinc-950/90 shadow-lg shadow-black/20 backdrop-blur-lg"
          : "bg-transparent"
      )}
    >
      <nav
        aria-label="Ana navigasyon"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/* ── Ana satır ── */}
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Masaüstü CTA */}
          <div className="hidden md:block">
            <CtaButton onClick={navigateToAnalyze} />
          </div>

          {/* Mobil hamburger */}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setMenuOpen((prev) => !prev)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg md:hidden",
              "text-[var(--color-foreground)]/70 transition-all duration-150",
              "hover:bg-white/8 hover:text-[var(--color-foreground)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            )}
          >
            {menuOpen
              ? <X    size={20} aria-hidden />
              : <Menu size={20} aria-hidden />
            }
          </button>
        </div>

        {/* ── Mobil menü ── */}
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onCtaClick={navigateToAnalyze}
        />
      </nav>
    </header>
  );
}
